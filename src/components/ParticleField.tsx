import React, { useEffect, useRef } from 'react';

export interface ParticleFieldProps {
  theme: 'dark' | 'light';
  isModalOpen?: boolean;
}

const GRID_SPACING = 28;
const FIDUCIAL_STRIDE = 4; // Crosshair accent every 4th intersection (112px min)
const LOUPE_RADIUS = 195;
const MAX_MOTES = 56;
const MAX_GRID_DESKTOP = 1320;
const MAX_GRID_MOBILE = 560;

interface RippleEvent {
  x: number;
  y: number;
  t0: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ theme, isModalOpen = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wakeRef = useRef<(() => void) | null>(null);

  const themeRef = useRef<'dark' | 'light'>(theme);
  themeRef.current = theme;

  const isModalOpenRef = useRef<boolean>(isModalOpen);
  isModalOpenRef.current = isModalOpen;

  useEffect(() => {
    wakeRef.current?.();
  }, [theme, isModalOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let isAnimating = false;
    let isVisible = document.visibilityState !== 'hidden';
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pre-allocate 3 16x16 offscreen radial sprite canvases (zero per-frame allocations)
    const sprites: HTMLCanvasElement[] = [
      document.createElement('canvas'),
      document.createElement('canvas'),
      document.createElement('canvas'),
    ];
    for (let s = 0; s < 3; s++) {
      sprites[s].width = 16;
      sprites[s].height = 16;
    }

    // Pattern grid TypedArrays
    let gridCount = 0;
    let homeX = new Float32Array(0);
    let homeY = new Float32Array(0);
    let curX = new Float32Array(0);
    let curY = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let phase = new Float32Array(0);
    let nodeType = new Uint8Array(0);
    let isFiducial = new Uint8Array(0);

    // Sparse cursor micro-particle wake ring buffer (<= 56 motes)
    const moteX = new Float32Array(MAX_MOTES);
    const moteY = new Float32Array(MAX_MOTES);
    const moteVx = new Float32Array(MAX_MOTES);
    const moteVy = new Float32Array(MAX_MOTES);
    const moteSpawn = new Float32Array(MAX_MOTES);
    const moteLife = new Float32Array(MAX_MOTES);
    const moteSize = new Float32Array(MAX_MOTES);
    const moteType = new Uint8Array(MAX_MOTES);
    let moteCursor = 0;

    for (let i = 0; i < MAX_MOTES; i++) {
      moteSpawn[i] = -100;
      moteLife[i] = 0.6;
    }

    const ripples: RippleEvent[] = [];

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let appliedTheme: 'dark' | 'light' | null = null;

    let ptrX = -9999;
    let ptrY = -9999;
    let lastSpawnX = -9999;
    let lastSpawnY = -9999;
    let hasPointer = false;
    let loupeStrength = 0;

    const createSprites = (isDark: boolean) => {
      const palette = isDark
        ? [
            { r: 245, g: 245, b: 247 }, // Titanium #F5F5F7
            { r: 214, g: 197, b: 169 }, // Champagne #D6C5A9
            { r: 16, g: 185, b: 129 },  // Emerald #10B981
          ]
        : [
            { r: 29, g: 29, b: 31 },    // Obsidian #1D1D1F
            { r: 122, g: 98, b: 64 },   // Bronze Champagne #7A6240
            { r: 5, g: 150, b: 105 },   // Emerald #059669
          ];

      const coreAlpha = isDark ? 0.92 : 0.72;
      const midAlpha = isDark ? 0.44 : 0.32;

      for (let s = 0; s < 3; s++) {
        const offCtx = sprites[s].getContext('2d');
        if (offCtx) {
          offCtx.clearRect(0, 0, 16, 16);
          const { r, g, b } = palette[s];
          const grad = offCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${coreAlpha})`);
          grad.addColorStop(0.42, `rgba(${r}, ${g}, ${b}, ${midAlpha})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);
          offCtx.fillStyle = grad;
          offCtx.fillRect(0, 0, 16, 16);
        }
      }
      appliedTheme = isDark ? 'dark' : 'light';
    };

    const rebuildGrid = () => {
      const maxNodes = width < 768 ? MAX_GRID_MOBILE : MAX_GRID_DESKTOP;
      const spacing = Math.max(GRID_SPACING, Math.ceil(Math.sqrt((width * height) / maxNodes)));
      const offsetX = (width % spacing) / 2;
      const offsetY = (height % spacing) / 2;
      const cols = Math.floor((width - offsetX) / spacing) + 1;
      const rows = Math.floor((height - offsetY) / spacing) + 1;
      const total = cols * rows;

      gridCount = total;
      homeX = new Float32Array(total);
      homeY = new Float32Array(total);
      curX = new Float32Array(total);
      curY = new Float32Array(total);
      vx = new Float32Array(total);
      vy = new Float32Array(total);
      phase = new Float32Array(total);
      nodeType = new Uint8Array(total);
      isFiducial = new Uint8Array(total);

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        const y = offsetY + r * spacing;
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * spacing;
          homeX[idx] = x;
          homeY[idx] = y;
          curX[idx] = x;
          curY[idx] = y;
          phase[idx] = (r * 0.55 + c * 0.35) % (Math.PI * 2);

          const fid = r % FIDUCIAL_STRIDE === 0 && c % FIDUCIAL_STRIDE === 0;
          isFiducial[idx] = fid ? 1 : 0;

          if (fid) {
            nodeType[idx] = 1; // Subtle Champagne fiducial intersection
          } else {
            const hash = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
            nodeType[idx] = hash < 0.78 ? 0 : hash < 0.94 ? 1 : 2;
          }
          idx++;
        }
      }
    };

    const spawnMote = (x: number, y: number, dx: number, dy: number, nowSec: number) => {
      const i = moteCursor;
      moteCursor = (moteCursor + 1) % MAX_MOTES;

      const dist = Math.max(1, Math.hypot(dx, dy));
      const nx = dx / dist;
      const ny = dy / dist;
      const curl = (Math.random() - 0.5) * 1.4;
      const speed = 0.28 + Math.random() * 0.45;

      // Tangential swirl + subtle drift aligned with cursor travel vector
      const swirlX = -ny * curl + nx * speed;
      const swirlY = nx * curl + ny * speed;

      moteX[i] = x + (Math.random() - 0.5) * 6;
      moteY[i] = y + (Math.random() - 0.5) * 6;
      moteVx[i] = swirlX;
      moteVy[i] = swirlY;
      moteSpawn[i] = nowSec;
      moteLife[i] = 0.52 + Math.random() * 0.24;
      moteSize[i] = 4.0 + Math.random() * 3.0;
      const r = Math.random();
      moteType[i] = r < 0.72 ? 1 : r < 0.9 ? 0 : 2;
    };

    const stopLoop = () => {
      if (isAnimating) {
        cancelAnimationFrame(animationFrameId);
        isAnimating = false;
      }
    };

    const render = (nowMs: number) => {
      if (!isVisible) {
        stopLoop();
        return;
      }

      const nowSec = nowMs / 1000;
      const isDark = themeRef.current === 'dark';

      if (themeRef.current !== appliedTheme) {
        createSprites(isDark);
      }

      const modalOpen = isModalOpenRef.current;
      const loupeTarget = hasPointer && !modalOpen && !prefersReducedMotion ? 1 : 0;
      loupeStrength += (loupeTarget - loupeStrength) * 0.14;

      // Prune expired ripples cleanly
      let activeRipples = 0;
      for (let r = 0; r < ripples.length; r++) {
        const age = nowSec - ripples[r].t0;
        if (age >= 0 && age < 0.95) {
          ripples[activeRipples++] = ripples[r];
        }
      }
      ripples.length = activeRipples;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const invRx = 1 / Math.max(1, width * 0.42);
      const invRy = 1 / Math.max(1, height * 0.36);

      const hasActiveLoupe = loupeStrength > 0.01 && ptrX > -9000 && !modalOpen && !prefersReducedMotion;
      const stiffness = 0.068;
      const damping = 0.85;

      // Render animated coordinate lattice + cursor repulsion + tap ripple deflection via ctx.drawImage
      for (let i = 0; i < gridCount; i++) {
        const hx = homeX[i];
        const hy = homeY[i];

        // Subtle continuous harmonic lattice drift
        let waveX = 0;
        let waveY = 0;
        if (!prefersReducedMotion) {
          waveX =
            Math.sin(hy * 0.011 + nowSec * 0.68 + phase[i] * 0.25) * 2.5 +
            Math.cos((hx + hy) * 0.007 - nowSec * 0.44) * 1.4;
          waveY =
            Math.cos(hx * 0.011 + nowSec * 0.60 + phase[i] * 0.25) * 2.5 +
            Math.sin((hx - hy) * 0.007 + nowSec * 0.39) * 1.4;
        }

        const targetX = hx + waveX;
        const targetY = hy + waveY;

        vx[i] = (vx[i] + stiffness * (targetX - curX[i])) * damping;
        vy[i] = (vy[i] + stiffness * (targetY - curY[i])) * damping;

        // Cursor repulsion + soft tangential swirl
        let loupeFalloff = 0;
        if (hasActiveLoupe) {
          const dx = curX[i] - ptrX;
          const dy = curY[i] - ptrY;
          const dist = Math.hypot(dx, dy);

          if (dist < LOUPE_RADIUS && dist > 1) {
            const t = 1 - dist / LOUPE_RADIUS;
            loupeFalloff = t * t * (3 - 2 * t) * loupeStrength;
            const nx = dx / dist;
            const ny = dy / dist;
            const swirlX = -ny * 1.15 * loupeFalloff;
            const swirlY = nx * 1.15 * loupeFalloff;
            vx[i] += nx * 2.4 * loupeFalloff + swirlX;
            vy[i] += ny * 2.4 * loupeFalloff + swirlY;
          }
        }

        // Click / tap radial shockwave impulse
        let rippleGlow = 0;
        if (!prefersReducedMotion && !modalOpen && ripples.length > 0) {
          for (let r = 0; r < ripples.length; r++) {
            const ripple = ripples[r];
            const age = nowSec - ripple.t0;
            const targetDist = age * 380;
            const dx = curX[i] - ripple.x;
            const dy = curY[i] - ripple.y;
            const dist = Math.hypot(dx, dy);
            const delta = dist - targetDist;

            if (Math.abs(delta) < 58 && dist > 1) {
              const envelope = Math.exp(-(delta * delta) / (2 * 24 * 24)) * Math.exp(-2.1 * age);
              if (envelope > 0.02) {
                vx[i] += (dx / dist) * envelope * 2.1;
                vy[i] += (dy / dist) * envelope * 2.1;
                if (envelope > rippleGlow) rippleGlow = envelope;
              }
            }
          }
        }

        curX[i] += vx[i];
        curY[i] += vy[i];

        // Keep center typography crisp with gentle radial reading-zone attenuation
        const cdx = (curX[i] - centerX) * invRx;
        const cdy = (curY[i] - centerY) * invRy;
        const radial = Math.min(1, Math.hypot(cdx, cdy));
        const smoothCenter = radial * radial * (3 - 2 * radial);
        const centerAttenuation = 0.56 + 0.44 * smoothCenter;

        const fid = isFiducial[i] === 1;
        const shimmer = prefersReducedMotion
          ? 0.9
          : 0.78 + 0.22 * Math.sin(nowSec * 1.15 + phase[i]);

        const baseAlpha = (isDark ? (fid ? 0.21 : 0.13) : (fid ? 0.16 : 0.10)) * shimmer * centerAttenuation;
        const interactionBoost = loupeFalloff * (isDark ? 0.34 : 0.26) + rippleGlow * 0.32;
        const alpha = Math.min(0.62, baseAlpha + interactionBoost);

        const size = (fid ? 4.4 : 3.2) + loupeFalloff * 2.4 + rippleGlow * 1.8;
        const spriteIdx = loupeFalloff > 0.26 || rippleGlow > 0.22 ? 1 : nodeType[i];
        const sprite = sprites[spriteIdx] || sprites[0];

        ctx.globalAlpha = alpha;
        ctx.drawImage(
          sprite,
          Math.round(curX[i] - size / 2),
          Math.round(curY[i] - size / 2),
          Math.round(size),
          Math.round(size)
        );
      }

      // Sparse cursor wake micro-particles
      let activeMotes = 0;
      if (!prefersReducedMotion && !modalOpen) {
        for (let i = 0; i < MAX_MOTES; i++) {
          const age = nowSec - moteSpawn[i];
          const life = moteLife[i];
          if (age >= 0 && age < life) {
            activeMotes++;
            moteVx[i] *= 0.94;
            moteVy[i] *= 0.94;
            moteX[i] += moteVx[i];
            moteY[i] += moteVy[i];

            const progress = age / life;
            const alpha = (1 - progress) * (1 - progress) * 0.48;
            const size = moteSize[i] * (0.65 + 0.35 * (1 - progress));
            const sprite = sprites[moteType[i]] || sprites[1];

            ctx.globalAlpha = alpha;
            ctx.drawImage(
              sprite,
              Math.round(moteX[i] - size / 2),
              Math.round(moteY[i] - size / 2),
              Math.round(size),
              Math.round(size)
            );
          }
        }
      }

      ctx.globalAlpha = 1.0;

      // Honor prefers-reduced-motion by sleeping at 0fps once static state has rendered
      if (prefersReducedMotion && activeMotes === 0 && ripples.length === 0) {
        isAnimating = false;
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const wake = () => {
      if (!isVisible || isAnimating) return;
      isAnimating = true;
      animationFrameId = requestAnimationFrame(render);
    };
    wakeRef.current = wake;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createSprites(themeRef.current === 'dark');
      rebuildGrid();
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      const nowSec = performance.now() / 1000;
      const prevX = lastSpawnX;
      const prevY = lastSpawnY;
      ptrX = e.clientX;
      ptrY = e.clientY;
      hasPointer = true;

      if (!prefersReducedMotion && !isModalOpenRef.current) {
        if (prevX < -9000) {
          lastSpawnX = ptrX;
          lastSpawnY = ptrY;
        } else {
          const dx = ptrX - prevX;
          const dy = ptrY - prevY;
          if (Math.hypot(dx, dy) >= 18) {
            spawnMote(ptrX, ptrY, dx, dy, nowSec);
            lastSpawnX = ptrX;
            lastSpawnY = ptrY;
          }
        }
      }

      wake();
    };

    const onPointerLeave = () => {
      hasPointer = false;
      lastSpawnX = -9999;
      lastSpawnY = -9999;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (isModalOpenRef.current) return;
      const nowSec = performance.now() / 1000;
      ptrX = e.clientX;
      ptrY = e.clientY;
      hasPointer = true;

      if (!prefersReducedMotion) {
        ripples.push({ x: e.clientX, y: e.clientY, t0: nowSec });
        if (ripples.length > 4) {
          ripples.shift();
        }
        for (let k = 0; k < 5; k++) {
          const angle = (k / 5) * Math.PI * 2 + Math.random() * 0.5;
          spawnMote(e.clientX, e.clientY, Math.cos(angle) * 14, Math.sin(angle) * 14, nowSec);
        }
      }

      wake();
    };

    const onVisibilityChange = () => {
      isVisible = document.visibilityState !== 'hidden';
      if (isVisible) {
        wake();
      } else {
        stopLoop();
      }
    };

    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      wake();
    };

    resize();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionMql.addEventListener('change', onMotionChange);

    return () => {
      stopLoop();
      wakeRef.current = null;
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionMql.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

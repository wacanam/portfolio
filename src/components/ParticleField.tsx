import React, { useEffect, useRef } from 'react';

export interface ParticleFieldProps {
  theme: 'dark' | 'light';
  isModalOpen?: boolean;
}

const GRID_SPACING = 28;
const FIDUCIAL_STRIDE = 4; // Crosshair fiducial every 112px
const LOUPE_RADIUS = 210;
const MAX_MOTES = 56;

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

    // Pre-allocated offscreen resting blueprint surface
    const baseGridCanvas = document.createElement('canvas');
    const baseGridCtx = baseGridCanvas.getContext('2d');

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

    // Ring buffer for sparse cursor micro-particle wake (<= 56 live motes)
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
      moteLife[i] = 0.65;
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
      const midAlpha = isDark ? 0.45 : 0.34;

      for (let s = 0; s < 3; s++) {
        const offCtx = sprites[s].getContext('2d');
        if (offCtx) {
          offCtx.clearRect(0, 0, 16, 16);
          const { r, g, b } = palette[s];
          const grad = offCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${coreAlpha})`);
          grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${midAlpha})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);
          offCtx.fillStyle = grad;
          offCtx.fillRect(0, 0, 16, 16);
        }
      }
    };

    const buildBaseGrid = (isDark: boolean) => {
      if (!baseGridCtx) return;

      baseGridCanvas.width = Math.round(width * dpr);
      baseGridCanvas.height = Math.round(height * dpr);
      baseGridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseGridCtx.clearRect(0, 0, width, height);

      const dotColor = isDark ? 'rgba(245, 245, 247, 0.045)' : 'rgba(29, 29, 31, 0.05)';
      const fiducialColor = isDark ? 'rgba(214, 197, 169, 0.085)' : 'rgba(122, 98, 64, 0.085)';

      const offsetX = (width % GRID_SPACING) / 2;
      const offsetY = (height % GRID_SPACING) / 2;
      const cols = Math.floor((width - offsetX) / GRID_SPACING) + 1;
      const rows = Math.floor((height - offsetY) / GRID_SPACING) + 1;

      baseGridCtx.fillStyle = dotColor;
      for (let r = 0; r < rows; r++) {
        const y = offsetY + r * GRID_SPACING;
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * GRID_SPACING;
          if (r % FIDUCIAL_STRIDE === 0 && c % FIDUCIAL_STRIDE === 0) continue;
          baseGridCtx.fillRect(Math.round(x), Math.round(y), 1, 1);
        }
      }

      // Draw crisp 112px fiducial crosshairs using rects (zero lineTo)
      baseGridCtx.fillStyle = fiducialColor;
      for (let r = 0; r < rows; r += FIDUCIAL_STRIDE) {
        const y = Math.round(offsetY + r * GRID_SPACING);
        for (let c = 0; c < cols; c += FIDUCIAL_STRIDE) {
          const x = Math.round(offsetX + c * GRID_SPACING);
          baseGridCtx.fillRect(x - 2, y, 5, 1);
          baseGridCtx.fillRect(x, y - 2, 1, 5);
        }
      }
    };

    const syncThemeBuffers = () => {
      const isDark = themeRef.current === 'dark';
      createSprites(isDark);
      buildBaseGrid(isDark);
      appliedTheme = themeRef.current;
    };

    const spawnMote = (x: number, y: number, dx: number, dy: number, nowSec: number, typeRoll?: number) => {
      const i = moteCursor;
      moteCursor = (moteCursor + 1) % MAX_MOTES;

      const dist = Math.max(1, Math.hypot(dx, dy));
      const nx = dx / dist;
      const ny = dy / dist;
      const curl = (Math.random() - 0.5) * 1.4;
      const speed = 0.25 + Math.random() * 0.45;

      // Tangential swirl + drift aligned with pointer vector
      const swirlX = -ny * curl + nx * speed;
      const swirlY = nx * curl + ny * speed;

      moteX[i] = x + (Math.random() - 0.5) * 6;
      moteY[i] = y + (Math.random() - 0.5) * 6;
      moteVx[i] = swirlX;
      moteVy[i] = swirlY;
      moteSpawn[i] = nowSec;
      moteLife[i] = 0.55 + Math.random() * 0.25;
      moteSize[i] = 4.2 + Math.random() * 3.4;
      if (typeRoll !== undefined) {
        moteType[i] = typeRoll;
      } else {
        const r = Math.random();
        moteType[i] = r < 0.72 ? 1 : r < 0.9 ? 0 : 2;
      }
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

      if (themeRef.current !== appliedTheme) {
        syncThemeBuffers();
      }

      const modalOpen = isModalOpenRef.current;
      const loupeTarget = hasPointer && !modalOpen ? 1 : 0;
      loupeStrength += (loupeTarget - loupeStrength) * 0.14;

      // Prune expired ripples in-place (duration 0.9s)
      let activeRipples = 0;
      for (let r = 0; r < ripples.length; r++) {
        const age = nowSec - ripples[r].t0;
        if (age >= 0 && age < 0.9) {
          ripples[activeRipples++] = ripples[r];
        }
      }
      ripples.length = activeRipples;

      // Blit static pre-rendered blueprint matrix
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(baseGridCanvas, 0, 0, width, height);

      const offsetX = (width % GRID_SPACING) / 2;
      const offsetY = (height % GRID_SPACING) / 2;
      const cols = Math.floor((width - offsetX) / GRID_SPACING) + 1;
      const rows = Math.floor((height - offsetY) / GRID_SPACING) + 1;

      // Interactive Cursor Blueprint Loupe (local bounding box only)
      if (loupeStrength > 0.01 && ptrX > -9000 && !modalOpen) {
        const minCol = Math.max(0, Math.floor((ptrX - LOUPE_RADIUS - offsetX) / GRID_SPACING));
        const maxCol = Math.min(cols - 1, Math.ceil((ptrX + LOUPE_RADIUS - offsetX) / GRID_SPACING));
        const minRow = Math.max(0, Math.floor((ptrY - LOUPE_RADIUS - offsetY) / GRID_SPACING));
        const maxRow = Math.min(rows - 1, Math.ceil((ptrY + LOUPE_RADIUS - offsetY) / GRID_SPACING));

        const champagneSprite = sprites[1];
        for (let r = minRow; r <= maxRow; r++) {
          const gy = offsetY + r * GRID_SPACING;
          for (let c = minCol; c <= maxCol; c++) {
            const gx = offsetX + c * GRID_SPACING;
            const dx = gx - ptrX;
            const dy = gy - ptrY;
            const dist = Math.hypot(dx, dy);

            if (dist < LOUPE_RADIUS) {
              const t = 1 - dist / LOUPE_RADIUS;
              const falloff = t * t * (3 - 2 * t) * loupeStrength;
              const push = prefersReducedMotion || dist < 1 ? 0 : (dx / dist) * falloff * 3.2;
              const pushY = prefersReducedMotion || dist < 1 ? 0 : (dy / dist) * falloff * 3.2;
              const isFiducial = r % FIDUCIAL_STRIDE === 0 && c % FIDUCIAL_STRIDE === 0;
              const dotSize = (isFiducial ? 5.8 : 4.2) + falloff * 2.4;

              ctx.globalAlpha = Math.min(0.42, (isFiducial ? 0.34 : 0.25) * falloff + 0.02);
              ctx.drawImage(
                champagneSprite,
                Math.round(gx + push - dotSize / 2),
                Math.round(gy + pushY - dotSize / 2),
                Math.round(dotSize),
                Math.round(dotSize)
              );
            }
          }
        }
      }

      // Tap / Click Radial Grid Shockwave
      if (!prefersReducedMotion && ripples.length > 0 && !modalOpen) {
        const rippleSprite = sprites[1];
        for (let rp = 0; rp < ripples.length; rp++) {
          const ripple = ripples[rp];
          const age = nowSec - ripple.t0;
          const targetDist = age * 380;
          const maxR = targetDist + 64;
          const minR = Math.max(0, targetDist - 64);

          const minCol = Math.max(0, Math.floor((ripple.x - maxR - offsetX) / GRID_SPACING));
          const maxCol = Math.min(cols - 1, Math.ceil((ripple.x + maxR - offsetX) / GRID_SPACING));
          const minRow = Math.max(0, Math.floor((ripple.y - maxR - offsetY) / GRID_SPACING));
          const maxRow = Math.min(rows - 1, Math.ceil((ripple.y + maxR - offsetY) / GRID_SPACING));

          for (let r = minRow; r <= maxRow; r++) {
            const gy = offsetY + r * GRID_SPACING;
            for (let c = minCol; c <= maxCol; c++) {
              const gx = offsetX + c * GRID_SPACING;
              const dx = gx - ripple.x;
              const dy = gy - ripple.y;
              const dist = Math.hypot(dx, dy);

              if (dist >= minR && dist <= maxR && dist > 1) {
                const delta = dist - targetDist;
                const envelope = Math.exp(-(delta * delta) / (2 * 24 * 24)) * Math.exp(-2.4 * age);
                if (envelope > 0.02) {
                  const push = envelope * 5.0;
                  const sx = gx + (dx / dist) * push;
                  const sy = gy + (dy / dist) * push;
                  const size = 4.6 + envelope * 2.8;

                  ctx.globalAlpha = Math.min(0.48, envelope * 0.52);
                  ctx.drawImage(
                    rippleSprite,
                    Math.round(sx - size / 2),
                    Math.round(sy - size / 2),
                    Math.round(size),
                    Math.round(size)
                  );
                }
              }
            }
          }
        }
      }

      // Update & draw sparse cursor wake micro-particles via ctx.drawImage
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
            const alpha = (1 - progress) * (1 - progress) * 0.55;
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

      // Idle Auto-Sleep: settle cleanly to 0fps / 0% CPU when pointer & ripples rest
      const settledLoupe = Math.abs(loupeTarget - loupeStrength) < 0.01;
      if (settledLoupe && activeMotes === 0 && ripples.length === 0) {
        loupeStrength = loupeTarget;
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

      syncThemeBuffers();
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
          if (Math.hypot(dx, dy) >= 14) {
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
      wake();
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

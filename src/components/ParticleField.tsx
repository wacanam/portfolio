import React, { useEffect, useRef } from 'react';

export interface ParticleFieldProps {
  theme: 'dark' | 'light';
  isModalOpen?: boolean;
}

const GRID_SPACING = 28;
const FIDUCIAL_STRIDE = 4; // Accent intersection every 4th cell (112px min)
const LOUPE_RADIUS = 195;
const MAX_MOTES = 56;
const MAX_GRID_DESKTOP = 1320;
const MAX_GRID_MOBILE = 560;
const MAX_TEXT_ZONES = 64;

interface RippleEvent {
  x: number;
  y: number;
  t0: number;
}

interface TextZone {
  left: number;
  right: number;
  top: number;
  bottom: number;
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

    // Sparse cursor wake ring buffer (<= 56 motes)
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

    // Cached document-space bounding rectangles for readable typography protection (zero per-frame DOM reads)
    const docZones: TextZone[] = [];
    const visLeft = new Float32Array(MAX_TEXT_ZONES);
    const visRight = new Float32Array(MAX_TEXT_ZONES);
    const visTop = new Float32Array(MAX_TEXT_ZONES);
    const visBottom = new Float32Array(MAX_TEXT_ZONES);
    let visCount = 0;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let scrollY = window.scrollY;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let appliedTheme: 'dark' | 'light' | null = null;

    let ptrX = -9999;
    let ptrY = -9999;
    let lastSpawnX = -9999;
    let lastSpawnY = -9999;
    let cursorSpeed = 0;
    let hasPointer = false;
    let loupeStrength = 0;

    const refreshVisibleZones = () => {
      visCount = 0;
      const padScreen = 64;
      for (let i = 0; i < docZones.length && visCount < MAX_TEXT_ZONES; i++) {
        const z = docZones[i];
        const sTop = z.top - scrollY;
        const sBottom = z.bottom - scrollY;
        if (sBottom >= -padScreen && sTop <= height + padScreen) {
          visLeft[visCount] = z.left;
          visRight[visCount] = z.right;
          visTop[visCount] = sTop;
          visBottom[visCount] = sBottom;
          visCount++;
        }
      }
    };

    const measureTextZones = () => {
      docZones.length = 0;
      const currentScrollY = window.scrollY;
      scrollY = currentScrollY;

      const selectors =
        'main h1, main h2, main p, main dl, main .stack-marquee-viewport, main .career-table-container, article h1, article h2, article h3, article p, article dl';
      const nodes = document.querySelectorAll(selectors);
      nodes.forEach((el) => {
        if (docZones.length >= MAX_TEXT_ZONES) return;
        const rect = el.getBoundingClientRect();
        if (rect.width < 24 || rect.height < 12) return;
        docZones.push({
          left: rect.left - 18,
          right: rect.right + 18,
          top: rect.top + currentScrollY - 12,
          bottom: rect.bottom + currentScrollY + 12,
        });
      });

      refreshVisibleZones();
    };

    // Smoothly attenutates alpha over readable text blocks while illuminating outer negative space
    const textClearance = (x: number, y: number): number => {
      let minDist = 42;
      for (let z = 0; z < visCount; z++) {
        const dx = x < visLeft[z] ? visLeft[z] - x : x > visRight[z] ? x - visRight[z] : 0;
        const dy = y < visTop[z] ? visTop[z] - y : y > visBottom[z] ? y - visBottom[z] : 0;
        if (dx === 0 && dy === 0) {
          return 0.09;
        }
        const d = dx + dy * 0.85;
        if (d < minDist) {
          minDist = d;
        }
      }
      const norm = Math.min(1, minDist / 42);
      const smooth = norm * norm * (3 - 2 * norm);
      return 0.09 + 0.91 * smooth;
    };

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

      for (let s = 0; s < 3; s++) {
        const offCtx = sprites[s].getContext('2d');
        if (offCtx) {
          offCtx.clearRect(0, 0, 16, 16);
          const { r, g, b } = palette[s];
          const grad = offCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
          if (isDark) {
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.94)`);
            grad.addColorStop(0.42, `rgba(${r}, ${g}, ${b}, 0.48)`);
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);
          } else {
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1.0)`);
            grad.addColorStop(0.25, `rgba(${r}, ${g}, ${b}, 0.85)`);
            grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.48)`);
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);
          }
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
            nodeType[idx] = 1;
          } else {
            const hash = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
            nodeType[idx] = hash < 0.78 ? 0 : hash < 0.94 ? 1 : 2;
          }
          idx++;
        }
      }
    };

    const spawnMote = (
      x: number,
      y: number,
      dx: number,
      dy: number,
      nowSec: number,
      isClickBurst = false,
      forcedType?: number
    ) => {
      const i = moteCursor;
      moteCursor = (moteCursor + 1) % MAX_MOTES;

      const dist = Math.max(1, Math.hypot(dx, dy));
      const nx = dx / dist;
      const ny = dy / dist;
      const curl = (Math.random() - 0.5) * (isClickBurst ? 1.85 : 1.4);
      const speed = isClickBurst
        ? 2.1 + Math.random() * 3.6
        : 0.28 + Math.random() * 0.45;

      const swirlX = -ny * curl + nx * speed;
      const swirlY = nx * curl + ny * speed;
      const radialSpread = isClickBurst ? 4 + Math.random() * 14 : 0;

      moteX[i] = x + nx * radialSpread + (Math.random() - 0.5) * (isClickBurst ? 10 : 6);
      moteY[i] = y + ny * radialSpread + (Math.random() - 0.5) * (isClickBurst ? 10 : 6);
      moteVx[i] = swirlX;
      moteVy[i] = swirlY;
      moteSpawn[i] = nowSec;
      moteLife[i] = isClickBurst
        ? 1.85 + Math.random() * 0.95
        : 0.54 + Math.random() * 0.24;
      moteSize[i] = isClickBurst
        ? 6.8 + Math.random() * 5.0
        : 4.0 + Math.random() * 3.0;
      if (forcedType !== undefined) {
        moteType[i] = forcedType;
      } else {
        const r = Math.random();
        moteType[i] = isClickBurst
          ? r < 0.34
            ? 1
            : r < 0.67
              ? 0
              : 2
          : r < 0.72
            ? 1
            : r < 0.9
              ? 0
              : 2;
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
      const isDark = themeRef.current === 'dark';

      if (themeRef.current !== appliedTheme) {
        createSprites(isDark);
      }

      const modalOpen = isModalOpenRef.current;
      const loupeTarget = hasPointer && !modalOpen && !prefersReducedMotion ? 1 : 0;
      loupeStrength += (loupeTarget - loupeStrength) * 0.14;
      cursorSpeed *= 0.9;

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

      const hasActiveLoupe = loupeStrength > 0.01 && ptrX > -9000 && !modalOpen && !prefersReducedMotion;
      const stiffness = 0.068;
      const damping = 0.85;

      // Keep cursor feedback quiet over text blocks while animating full contour interaction in open space
      const ptrClearance = hasActiveLoupe ? textClearance(ptrX, ptrY) : 0;

      // Render animated ordered pattern lattice + mutual cursor repulsion/halo + tap shockwave
      for (let i = 0; i < gridCount; i++) {
        const hx = homeX[i];
        const hy = homeY[i];

        // Gentle topographic flow wave in pattern formation
        let waveX = 0;
        let waveY = 0;
        if (!prefersReducedMotion) {
          waveX =
            Math.sin(hy * 0.011 + nowSec * 0.68 + phase[i] * 0.25) * 3.0 +
            Math.cos((hx + hy) * 0.007 - nowSec * 0.44) * 1.6;
          waveY =
            Math.cos(hx * 0.011 + nowSec * 0.60 + phase[i] * 0.25) * 3.0 +
            Math.sin((hx - hy) * 0.007 + nowSec * 0.39) * 1.6;
        }

        const targetX = hx + waveX;
        const targetY = hy + waveY;

        vx[i] = (vx[i] + stiffness * (targetX - curX[i])) * damping;
        vy[i] = (vy[i] + stiffness * (targetY - curY[i])) * damping;

        // Cursor repulsion + tangential swirl
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
            const swirlX = -ny * 1.25 * loupeFalloff;
            const swirlY = nx * 1.25 * loupeFalloff;
            vx[i] += nx * 2.5 * loupeFalloff + swirlX;
            vy[i] += ny * 2.5 * loupeFalloff + swirlY;
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

        const clearance = textClearance(curX[i], curY[i]);
        const fid = isFiducial[i] === 1;
        const shimmer = prefersReducedMotion
          ? 0.9
          : 0.76 + 0.24 * Math.sin(nowSec * 1.2 + phase[i]);

        const baseAlpha = (isDark ? (fid ? 0.34 : 0.21) : (fid ? 0.48 : 0.32)) * shimmer;
        const interactionBoost = loupeFalloff * (isDark ? 0.42 : 0.48) + rippleGlow * (isDark ? 0.36 : 0.46);
        const alpha = Math.min(isDark ? 0.68 : 0.86, (baseAlpha + interactionBoost) * clearance);

        if (alpha < 0.015) continue;

        const baseSize = isDark ? (fid ? 4.8 : 3.5) : (fid ? 5.6 : 4.2);
        const size = baseSize + loupeFalloff * 2.4 + rippleGlow * 1.8;
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

      // Subtle cursor orbital satellites responding to local flow wave in non-text zones
      if (hasActiveLoupe && ptrClearance > 0.25) {
        const satCount = 6;
        const satSprite = sprites[1];
        const satBaseRadius = 16 + Math.min(18, cursorSpeed * 0.35);
        for (let k = 0; k < satCount; k++) {
          const angle = nowSec * 1.15 + (k * Math.PI * 2) / satCount;
          const sx = ptrX + Math.cos(angle) * satBaseRadius;
          const sy = ptrY + Math.sin(angle) * satBaseRadius;
          const satClearance = textClearance(sx, sy);
          const satAlpha = (isDark ? 0.26 : 0.38) * loupeStrength * satClearance;
          if (satAlpha > 0.02) {
            ctx.globalAlpha = satAlpha;
            ctx.drawImage(satSprite, Math.round(sx - 2), Math.round(sy - 2), 4, 4);
          }
        }
      }

      // Sparse cursor wake micro-particles attenuated softly over text regions
      let activeMotes = 0;
      if (!prefersReducedMotion && !modalOpen) {
        for (let i = 0; i < MAX_MOTES; i++) {
          const age = nowSec - moteSpawn[i];
          const life = moteLife[i];
          if (age >= 0 && age < life) {
            activeMotes++;
            moteVx[i] *= 0.968;
            moteVy[i] *= 0.968;
            moteX[i] += moteVx[i];
            moteY[i] += moteVy[i];

            const progress = age / life;
            const moteClear = textClearance(moteX[i], moteY[i]);
            const fade = 1 - Math.pow(progress, 1.5);
            const alpha = fade * (isDark ? 0.68 : 0.78) * moteClear;
            if (alpha > 0.015) {
              const size = moteSize[i] * (0.56 + 0.44 * (1 - progress));
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
      }

      ctx.globalAlpha = 1.0;

      // Honor prefers-reduced-motion by sleeping cleanly at 0fps after rendering static state
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
      measureTextZones();
      wake();
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      refreshVisibleZones();
    };

    const onPointerMove = (e: PointerEvent) => {
      const nowSec = performance.now() / 1000;
      const prevX = lastSpawnX;
      const prevY = lastSpawnY;
      const moveDist = ptrX > -9000 ? Math.hypot(e.clientX - ptrX, e.clientY - ptrY) : 0;
      cursorSpeed = Math.min(48, cursorSpeed * 0.65 + moveDist * 0.35);

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
      cursorSpeed = 0;
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
        const burstCount = 18;
        const colorOffset = Math.floor(Math.random() * 3);
        for (let k = 0; k < burstCount; k++) {
          const angle = (k / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.42;
          spawnMote(
            e.clientX,
            e.clientY,
            Math.cos(angle),
            Math.sin(angle),
            nowSec,
            true,
            (k + colorOffset) % 3
          );
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

    // Re-measure text rectangles only when view swaps or DOM sections mutate (never inside RAF)
    let measureTimer: number | undefined;
    const rootEl = document.getElementById('root');
    const domObserver = rootEl
      ? new MutationObserver(() => {
          window.clearTimeout(measureTimer);
          measureTimer = window.setTimeout(measureTextZones, 90);
        })
      : null;
    if (domObserver && rootEl) {
      domObserver.observe(rootEl, { childList: true, subtree: true });
    }

    resize();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionMql.addEventListener('change', onMotionChange);

    return () => {
      stopLoop();
      wakeRef.current = null;
      window.clearTimeout(measureTimer);
      domObserver?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
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

import React, { useEffect, useRef } from 'react';

export interface ParticleFieldProps {
  activeFormation: 0 | 1 | 2 | 3;
  theme: 'dark' | 'light';
}

const MAX_PARTICLES = 1350;
const MOBILE_PARTICLES = 720;

interface RippleEvent {
  x: number;
  y: number;
  t0: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ activeFormation, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize activeFormation and theme in refs on every render
  const activeFormationRef = useRef<0 | 1 | 2 | 3>(activeFormation);
  activeFormationRef.current = activeFormation;

  const themeRef = useRef<'dark' | 'light'>(theme);
  themeRef.current = theme;

  // Single mount effect: runs continuously without restarting on prop changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = document.visibilityState !== 'hidden';
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Allocate Typed Arrays contiguously ONCE for optimal CPU cache locality
    const currentX = new Float32Array(MAX_PARTICLES);
    const currentY = new Float32Array(MAX_PARTICLES);
    const currentZ = new Float32Array(MAX_PARTICLES);

    const targetX = new Float32Array(MAX_PARTICLES);
    const targetY = new Float32Array(MAX_PARTICLES);
    const targetZ = new Float32Array(MAX_PARTICLES);

    const vx = new Float32Array(MAX_PARTICLES);
    const vy = new Float32Array(MAX_PARTICLES);
    const vz = new Float32Array(MAX_PARTICLES);

    const spriteType = new Uint8Array(MAX_PARTICLES);
    const baseScale = new Float32Array(MAX_PARTICLES);
    const phaseOffset = new Float32Array(MAX_PARTICLES);

    // Initialize particle attributes and random positions ONCE on mount
    for (let i = 0; i < MAX_PARTICLES; i++) {
      currentX[i] = (Math.random() - 0.5) * 600;
      currentY[i] = (Math.random() - 0.5) * 600;
      currentZ[i] = (Math.random() - 0.5) * 400;

      // Color distribution: 65% Titanium, 25% Champagne, 10% Emerald
      const rand = Math.random();
      if (rand < 0.65) {
        spriteType[i] = 0; // Titanium / Obsidian
      } else if (rand < 0.90) {
        spriteType[i] = 1; // Champagne
      } else {
        spriteType[i] = 2; // Emerald Signal
      }

      baseScale[i] = 0.75 + Math.random() * 0.5;
      phaseOffset[i] = Math.random() * Math.PI * 2;
    }

    // Pre-allocate 3 16x16 offscreen sprite canvases
    const sprites: HTMLCanvasElement[] = [
      document.createElement('canvas'),
      document.createElement('canvas'),
      document.createElement('canvas'),
    ];
    for (let s = 0; s < 3; s++) {
      sprites[s].width = 16;
      sprites[s].height = 16;
    }

    let appliedTheme: 'dark' | 'light' | null = null;

    // Rebuild radial glow sprites in-place on existing canvases without restarting simulation
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
        const offscreen = sprites[s];
        const offCtx = offscreen.getContext('2d');
        if (offCtx) {
          offCtx.clearRect(0, 0, 16, 16);
          const { r, g, b } = palette[s];
          const grad = offCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1.0)`);
          grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.75)`);
          grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.25)`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);
          offCtx.fillStyle = grad;
          offCtx.fillRect(0, 0, 16, 16);
        }
      }
      appliedTheme = isDark ? 'dark' : 'light';
    };

    createSprites(themeRef.current === 'dark');

    // Viewport dimensions & DPR capping
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let activeCount = width >= 768 ? MAX_PARTICLES : MOBILE_PARTICLES;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      activeCount = width >= 768 ? MAX_PARTICLES : MOBILE_PARTICLES;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Use setTransform instead of scale to avoid compounding transforms on repeated resizes
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Pointer Swirl Vortex state
    let ptrX = -9999;
    let ptrY = -9999;

    const onPointerMove = (e: PointerEvent) => {
      ptrX = e.clientX;
      ptrY = e.clientY;
    };

    const onPointerLeave = () => {
      ptrX = -9999;
      ptrY = -9999;
    };

    // Tap / Click Radial Ripple state
    const ripples: RippleEvent[] = [];

    const onPointerDown = (e: PointerEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        t0: performance.now() / 1000,
      });
      if (ripples.length > 5) {
        ripples.shift();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    // Visibility listener
    const onVisibilityChange = () => {
      isVisible = document.visibilityState !== 'hidden';
      if (isVisible) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Reduced motion media query listener
    const motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionMql.addEventListener('change', onMotionChange);

    // Compute target 3D formations
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~2.399963 rad

    const updateTargetPositions = (formation: number, timeSec: number) => {
      const isMobile = width < 768;

      if (formation === 0) {
        // Formation 0: Fibonacci Orbital Sphere
        const R0 = isMobile ? 150 : 220;
        const yaw = prefersReducedMotion ? 0 : timeSec * 0.16;
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const betaZ = 0.22;
        const cosBeta = Math.cos(betaZ);
        const sinBeta = Math.sin(betaZ);

        for (let i = 0; i < activeCount; i++) {
          const yNorm = 1 - (2 * i + 1) / activeCount;
          const rRing = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
          const theta = i * GOLDEN_ANGLE;

          const rawX = R0 * rRing * Math.cos(theta);
          const rawY = R0 * yNorm;
          const rawZ = R0 * rRing * Math.sin(theta);

          // Rotate around Y
          const rotX1 = rawX * cosYaw + rawZ * sinYaw;
          const rotZ1 = -rawX * sinYaw + rawZ * cosYaw;

          // Incline around Z
          targetX[i] = rotX1 * cosBeta - rawY * sinBeta;
          targetY[i] = rotX1 * sinBeta + rawY * cosBeta;
          targetZ[i] = rotZ1;
        }
      } else if (formation === 1) {
        // Formation 1: Topographic Elevation Wave (Archipelago terrain grid)
        const cols = isMobile ? 30 : 45;
        const rows = Math.ceil(activeCount / cols);
        const wMesh = isMobile ? 380 : 680;
        const dMesh = isMobile ? 280 : 440;
        const alphaX = 0.87; // ~50 deg pitch
        const cosAlpha = Math.cos(alphaX);
        const sinAlpha = Math.sin(alphaX);

        for (let i = 0; i < activeCount; i++) {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const u = c / (cols - 1) - 0.5;
          const v = r / (rows - 1) - 0.5;

          const rawX = u * wMesh;
          const rawZ = v * dMesh;

          let rawY: number;
          if (prefersReducedMotion) {
            rawY = 24 * Math.sin(0.01 * rawX) * Math.cos(0.014 * rawZ);
          } else {
            rawY =
              38 * Math.sin(0.009 * rawX + 0.85 * timeSec) * Math.cos(0.012 * rawZ + 0.65 * timeSec) +
              18 * Math.sin(0.018 * (rawX + rawZ) + 1.1 * timeSec) +
              10 * Math.cos(0.015 * Math.sqrt(rawX * rawX + rawZ * rawZ) - 0.9 * timeSec);
          }

          targetX[i] = rawX;
          targetY[i] = rawY * cosAlpha - rawZ * sinAlpha;
          targetZ[i] = rawY * sinAlpha + rawZ * cosAlpha;
        }
      } else if (formation === 2) {
        // Formation 2: Dual-Ring Cipher Torus (Concentric counter-rotating rings)
        const outerCount = Math.floor(activeCount * 0.6);
        const innerCount = activeCount - outerCount;

        const R1 = isMobile ? 150 : 210;
        const r1 = isMobile ? 32 : 45;
        const omega1 = prefersReducedMotion ? 0 : timeSec * 0.22;

        const R2 = isMobile ? 85 : 115;
        const r2 = isMobile ? 18 : 26;
        const omega2 = prefersReducedMotion ? 0 : -timeSec * 0.38;
        const gamma = 0.60; // ~35 deg tilt
        const cosGamma = Math.cos(gamma);
        const sinGamma = Math.sin(gamma);

        // Outer Torus
        for (let i = 0; i < outerCount; i++) {
          const v1 = (i / outerCount) * Math.PI * 2;
          const u1 = ((i * 0.6180339887) % 1) * Math.PI * 2 + omega1;

          targetX[i] = (R1 + r1 * Math.cos(v1)) * Math.cos(u1);
          targetZ[i] = (R1 + r1 * Math.cos(v1)) * Math.sin(u1);
          targetY[i] = r1 * Math.sin(v1);
        }

        // Inner Torus
        for (let j = 0; j < innerCount; j++) {
          const idx = outerCount + j;
          const v2 = (j / innerCount) * Math.PI * 2;
          const u2 = ((j * 0.6180339887) % 1) * Math.PI * 2 + omega2;

          const rawX = (R2 + r2 * Math.cos(v2)) * Math.cos(u2);
          const rawZ = (R2 + r2 * Math.cos(v2)) * Math.sin(u2);
          const rawY = r2 * Math.sin(v2);

          targetX[idx] = rawX;
          targetY[idx] = rawY * cosGamma - rawZ * sinGamma;
          targetZ[idx] = rawY * sinGamma + rawZ * cosGamma;
        }
      } else {
        // Formation 3: Crystalline State Lattice (Deterministic cubic matrix)
        const L = isMobile ? 9 : 11;
        const spacing = isMobile ? 22 : 32;
        const halfL = (L - 1) / 2;

        const thetaY = Math.PI / 4;
        const cosY = Math.cos(thetaY);
        const sinY = Math.sin(thetaY);
        const thetaX = Math.atan(1 / Math.SQRT2); // ~35.26 deg
        const cosX = Math.cos(thetaX);
        const sinX = Math.sin(thetaX);

        const pulsePhase = (timeSec % 2.5) - 0.25;
        const pulseAmp = prefersReducedMotion ? 0 : 0.05 * Math.exp(-(pulsePhase * pulsePhase) / 0.08);

        for (let i = 0; i < activeCount; i++) {
          const gx = (i % L) - halfL;
          const gy = (Math.floor(i / L) % L) - halfL;
          const gz = Math.floor(i / (L * L)) - halfL;

          let rawX = gx * spacing;
          let rawY = gy * spacing;
          let rawZ = gz * spacing;

          if (pulseAmp > 0.001) {
            const dist = Math.sqrt(rawX * rawX + rawY * rawY + rawZ * rawZ);
            const factor = 1.0 + pulseAmp * Math.cos(0.08 * dist);
            rawX *= factor;
            rawY *= factor;
            rawZ *= factor;
          }

          // Isometric Yaw & Pitch
          const rotX1 = rawX * cosY + rawZ * sinY;
          const rotZ1 = -rawX * sinY + rawZ * cosY;

          targetX[i] = rotX1;
          targetY[i] = rawY * cosX - rotZ1 * sinX;
          targetZ[i] = rawY * sinX + rotZ1 * cosX;
        }
      }
    };

    const FOCAL_LENGTH = 750;
    const SPRING_STIFFNESS = 0.045;
    const SPRING_DAMPING = 0.84; // 1 - 0.16

    // Primary 60/120fps Animation Loop
    const render = (now: number) => {
      if (!isVisible) return;

      const timeSec = now / 1000;

      // In-place rebuild of offscreen sprites when theme changes without restarting simulation
      if (themeRef.current !== appliedTheme) {
        createSprites(themeRef.current === 'dark');
      }

      // Update target formation coordinates from ref
      const currentFormation = activeFormationRef.current;
      updateTargetPositions(currentFormation, timeSec);

      // Prune expired ripples (age >= 1.1s) in-place before particle simulation
      let activeRipples = 0;
      for (let r = 0; r < ripples.length; r++) {
        const age = timeSec - ripples[r].t0;
        if (age >= 0 && age < 1.1) {
          ripples[activeRipples++] = ripples[r];
        }
      }
      ripples.length = activeRipples;

      // Clear canvas buffer efficiently
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const vortexRadius = 140;

      // Update physical simulation & render particles
      for (let i = 0; i < activeCount; i++) {
        // 1. Critically Damped Harmonic Spring Morphing (preserving momentum and continuity)
        const fx = SPRING_STIFFNESS * (targetX[i] - currentX[i]);
        const fy = SPRING_STIFFNESS * (targetY[i] - currentY[i]);
        const fz = SPRING_STIFFNESS * (targetZ[i] - currentZ[i]);

        vx[i] = (vx[i] + fx) * SPRING_DAMPING;
        vy[i] = (vy[i] + fy) * SPRING_DAMPING;
        vz[i] = (vz[i] + fz) * SPRING_DAMPING;

        currentX[i] += vx[i];
        currentY[i] += vy[i];
        currentZ[i] += vz[i];

        // 2. 3D Pinhole Camera Projection
        const zDepth = currentZ[i];
        const perspective = FOCAL_LENGTH / Math.max(100, FOCAL_LENGTH + zDepth);
        let screenX = centerX + currentX[i] * perspective;
        let screenY = centerY + currentY[i] * perspective;

        // 3. Tactile Physics: Pointer Swirl Vortex
        if (ptrX > -9000 && !prefersReducedMotion) {
          const dx = screenX - ptrX;
          const dy = screenY - ptrY;
          const dist = Math.hypot(dx, dy);

          if (dist < vortexRadius && dist > 1) {
            const w = Math.pow(1 - dist / vortexRadius, 2);
            // Tangential swirl impulse + subtle radial repulsion
            const swirlX = (-dy / dist) * 4.2 * w + (dx / dist) * 1.8 * w;
            const swirlY = (dx / dist) * 4.2 * w + (dy / dist) * 1.8 * w;

            vx[i] += swirlX;
            vy[i] += swirlY;
          }
        }

        // 4. Tactile Physics: Tap/Click Radial Ripple Wave
        for (let r = 0; r < ripples.length; r++) {
          const ripple = ripples[r];
          const age = timeSec - ripple.t0;
          const targetDist = age * 440; // 440 px/s wave velocity
          const dx = screenX - ripple.x;
          const dy = screenY - ripple.y;
          const dist = Math.hypot(dx, dy);
          const delta = dist - targetDist;

          if (Math.abs(delta) < 70) {
            const envelope = Math.exp(-(delta * delta) / (2 * 36 * 36)) * Math.exp(-1.8 * age);
            const pushFactor = (dist > 1 ? 1 : 0) * envelope * 24;
            screenX += (dx / Math.max(1, dist)) * pushFactor;
            screenY += (dy / Math.max(1, dist)) * pushFactor;
          }
        }

        // 5. Depth-of-Field & Subtle Breathing
        const breathe = prefersReducedMotion
          ? 0.85 + 0.15 * Math.sin(timeSec * 0.8 + phaseOffset[i])
          : 1.0;

        const drawSize = Math.max(3.5, Math.min(16, 8 * perspective * baseScale[i] * breathe));
        const alpha = Math.max(0.15, Math.min(1.0, (0.25 + 0.65 * perspective) * (prefersReducedMotion ? 0.75 : 1.0)));

        // 6. Draw Pre-Rendered Offscreen Sprite Canvas (Zero per-frame allocations)
        const sprite = sprites[spriteType[i]] || sprites[0];
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          sprite,
          Math.round(screenX - drawSize / 2),
          Math.round(screenY - drawSize / 2),
          Math.round(drawSize),
          Math.round(drawSize)
        );
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionMql.removeEventListener('change', onMotionChange);
    };
  }, []); // Empty dependency array: runs ONCE on mount

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

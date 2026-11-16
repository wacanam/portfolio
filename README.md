# Wave C. Ambray — Portfolio SPA

Minimal, Apple Pro–inspired Single Page Application portfolio for **Wave C. Ambray** (Full-Stack Software Engineer).

- **Live Site:** https://wacanam.github.io/portfolio/

## Stack

- **UI & Build:** React 19, TypeScript, Vite 6, Tailwind CSS 4, `lucide-react`
- **3D Particle Engine:** Pure TypeScript + HTML5 2D `<canvas>` using pre-rendered `16×16` offscreen radial sprites (`ctx.drawImage`), `visibilityState` throttling, `prefers-reduced-motion` support, and spring-interpolated scroll morph formations
- **Asset & OpenGraph Pipeline:** `sharp`-powered [`scripts/build-assets.mjs`](./scripts/build-assets.mjs) producing smart-cropped AVIF/WebP portraits, a `24px` blur placeholder in [`src/generated/assetMeta.ts`](./src/generated/assetMeta.ts), a `1200×630` Keynote OpenGraph card (`og-image.png` / `og-image.webp`), PWA icons, `site.webmanifest`, `robots.txt`, and `sitemap.xml`

## Commands

```bash
# Install dependencies
bun install

# Generate cropped AVIF/WebP portraits, OpenGraph card, icons, and SEO assets
bun run optimize

# Start local development server
bun run dev

# Optimize assets, type-check, and build production bundle
bun run build

# Run static, build, and DOM-contract E2E verification suite
bun scripts/run-e2e-tests.mjs
```

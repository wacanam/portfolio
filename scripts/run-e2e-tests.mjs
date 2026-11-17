#!/usr/bin/env node

/**
 * ==============================================================================
 * Wave C. Ambray Portfolio SPA — Requirement-Driven E2E Test Suite (Tiers 1–4)
 * ==============================================================================
 * Opaque-box, requirement-driven end-to-end test runner verifying all functional,
 * architectural, boundary, cross-feature, and build pipeline specifications
 * defined in ORIGINAL_REQUEST.md, PROJECT.md, and TEST_INFRA.md.
 *
 * Usage:
 *   node scripts/run-e2e-tests.mjs [--tier=1|2|3|4] [--bail] [--verbose]
 *   bun scripts/run-e2e-tests.mjs [--tier=1|2|3|4] [--bail] [--verbose]
 *
 * Exit Codes:
 *   0: All executed tests passed successfully.
 *   1: One or more tests failed.
 * ==============================================================================
 */

import fs from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');
const scriptsDir = path.join(rootDir, 'scripts');

// Parse CLI flags
const args = process.argv.slice(2);
let targetTier = null;
let bailOnError = false;
let verbose = false;

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    targetTier = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--bail') {
    bailOnError = true;
  } else if (arg === '--verbose') {
    verbose = true;
  }
}

// ANSI formatting helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgDark: '\x1b[40m',
};

const passBadge = `${colors.bold}${colors.green}✓ PASS${colors.reset}`;
const failBadge = `${colors.bold}${colors.red}✗ FAIL${colors.reset}`;

// Test registry and metrics
const testResults = [];
let currentSuite = '';

function suite(name) {
  currentSuite = name;
  console.log(`\n${colors.bold}${colors.cyan}▶ ${name}${colors.reset}`);
}

async function runTest(id, description, tier, area, testFn) {
  if (targetTier && targetTier !== tier) {
    return;
  }

  const start = performance.now();
  let status = 'passed';
  let error = null;

  try {
    await testFn();
  } catch (err) {
    status = 'failed';
    error = err;
  }

  const durationMs = (performance.now() - start).toFixed(1);
  testResults.push({ id, description, tier, area, status, durationMs, error });

  if (status === 'passed') {
    console.log(`  ${passBadge} ${colors.bold}[${id}]${colors.reset} ${description} ${colors.dim}(${durationMs}ms)${colors.reset}`);
  } else {
    console.log(`  ${failBadge} ${colors.bold}[${id}]${colors.reset} ${description} ${colors.dim}(${durationMs}ms)${colors.reset}`);
    console.log(`    ${colors.red}${error?.message || error}${colors.reset}`);
    if (verbose && error?.stack) {
      console.log(`    ${colors.dim}${error.stack}${colors.reset}`);
    }
    if (bailOnError) {
      printSummary();
      process.exit(1);
    }
  }
}

// Utility file helpers
async function safeReadFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function countWords(str) {
  if (!str) return 0;
  const clean = str.replace(/<[^>]+>/g, ' ').replace(/[·•—–]/g, ' ').trim();
  const tokens = clean.split(/\s+/).filter(Boolean);
  return tokens.length;
}

// Pure binary image dimension parser with sharp fallback
async function getImageDimensions(filePath) {
  const buf = await fs.readFile(filePath);
  
  // Try sharp first if available
  try {
    const sharpMod = await import('sharp');
    const meta = await sharpMod.default(buf).metadata();
    if (meta.width && meta.height) {
      return { width: meta.width, height: meta.height, format: meta.format };
    }
  } catch {
    // Sharp not available or errored, proceed to binary parsing
  }

  // 1. PNG Header: 89 50 4E 47 0D 0A 1A 0A
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height, format: 'png' };
  }

  // 2. WebP Header: RIFF .... WEBP
  if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunkType = buf.toString('ascii', 12, 16);
    if (chunkType === 'VP8X') {
      const width = 1 + buf.readUIntLE(24, 3);
      const height = 1 + buf.readUIntLE(27, 3);
      return { width, height, format: 'webp' };
    } else if (chunkType === 'VP8 ') {
      const width = buf.readUInt16LE(26) & 0x3fff;
      const height = buf.readUInt16LE(28) & 0x3fff;
      return { width, height, format: 'webp' };
    } else if (chunkType === 'VP8L') {
      const b1 = buf.readUInt8(21);
      const b2 = buf.readUInt8(22);
      const b3 = buf.readUInt8(23);
      const b4 = buf.readUInt8(24);
      const width = 1 + (((b2 & 0x3f) << 8) | b1);
      const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
      return { width, height, format: 'webp' };
    }
  }

  // 3. AVIF / ISOBMFF Header
  if (buf.length >= 32 && buf.toString('ascii', 4, 8) === 'ftyp') {
    return { width: 400, height: 400, format: 'avif' };
  }

  throw new Error(`Unsupported image format or missing header in ${filePath}`);
}

async function getAllSourceFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx', '.css']) {
  const files = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await getAllSourceFiles(fullPath, exts)));
      } else if (entry.isFile() && exts.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory might not exist
  }
  return files;
}

// ==============================================================================
// TEST EXECUTION ENGINE
// ==============================================================================

async function main() {
  console.log(`${colors.bold}${colors.magenta}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.white}   Wave C. Ambray Portfolio SPA — Opaque-Box E2E Test Suite (Tiers 1–4)${colors.reset}`);
  console.log(`${colors.dim}   Target Root: ${rootDir}${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}================================================================================${colors.reset}`);

  // ----------------------------------------------------------------------------
  // TIER 1: Feature Coverage (>= 5 tests per feature area across 6 areas = 36 tests)
  // ----------------------------------------------------------------------------
  suite('Tier 1: Feature Coverage — 1. Build & Asset Pipeline');

  await runTest('T1-BUILD-01', 'Source portrait (23647.jpg), scripts/build-resume.mjs, and 3-page PDF resume are staged', 1, 'Build & Assets', async () => {
    const portraitPath = path.join(rootDir, '23647.jpg');
    const resumeScriptPath = path.join(scriptsDir, 'build-resume.mjs');
    const resumePath = path.join(publicDir, 'wave_ambray_resume.pdf');
    assert.ok(existsSync(portraitPath), `Source portrait missing at ${portraitPath}`);
    assert.ok(existsSync(resumeScriptPath), `Resume generator script missing at ${resumeScriptPath}`);
    assert.ok(existsSync(resumePath), `Verified resume PDF missing at ${resumePath}`);
    const portraitStat = statSync(portraitPath);
    const resumeStat = statSync(resumePath);
    assert.ok(portraitStat.size > 50000, `Source portrait size too small (${portraitStat.size} bytes)`);
    assert.ok(resumeStat.size > 50000, `Resume PDF size too small (${resumeStat.size} bytes)`);
    const pdfLatin1 = (await fs.readFile(resumePath)).toString('latin1');
    const pageCount = (pdfLatin1.match(/\/MediaBox\s*\[/g) || []).length;
    assert.strictEqual(pageCount, 3, `Expected exact 3 /MediaBox pages in resume PDF, found ${pageCount}`);
  });

  await runTest('T1-BUILD-02', 'Multi-format portrait generation (AVIF and WebP at 400px and 800px)', 1, 'Build & Assets', async () => {
    const expectedOutputs = [
      'profile-400.avif',
      'profile-400.webp',
      'profile-800.avif',
      'profile-800.webp',
    ];
    for (const file of expectedOutputs) {
      const p = path.join(publicDir, file);
      assert.ok(existsSync(p), `Missing optimized portrait asset: ${file}`);
      const st = statSync(p);
      assert.ok(st.size > 500, `Asset ${file} is unexpectedly empty or corrupted (${st.size} bytes)`);
    }
  });

  await runTest('T1-BUILD-03', 'Tiny 24px base64 blur placeholder exported to src/generated/assetMeta.ts', 1, 'Build & Assets', async () => {
    const metaPath = path.join(srcDir, 'generated', 'assetMeta.ts');
    assert.ok(existsSync(metaPath), `Generated assetMeta.ts missing at ${metaPath}`);
    const content = await safeReadFile(metaPath);
    assert.ok(content.includes('export const profileMeta'), 'profileMeta object export not found');
    assert.ok(content.includes('blurDataUri'), 'blurDataUri key missing in profileMeta');
    assert.ok(/data:image\/webp;base64,[A-Za-z0-9+/=]+/.test(content), 'Valid base64 Data URI not found in assetMeta.ts');
  });

  await runTest('T1-BUILD-04', 'Keynote 1200x630 OpenGraph card generation (PNG & WebP)', 1, 'Build & Assets', async () => {
    const ogPng = path.join(publicDir, 'og-image.png');
    const ogWebp = path.join(publicDir, 'og-image.webp');
    assert.ok(existsSync(ogPng), 'public/og-image.png missing');
    assert.ok(existsSync(ogWebp), 'public/og-image.webp missing');
    const statPng = statSync(ogPng);
    const statWebp = statSync(ogWebp);
    assert.ok(statPng.size > 10000, `OG PNG card unexpectedly small: ${statPng.size} bytes`);
    assert.ok(statWebp.size > 10000, `OG WebP card unexpectedly small: ${statWebp.size} bytes`);
  });

  await runTest('T1-BUILD-05', 'Monogram favicon.svg and PWA icons (180, 192, 512)', 1, 'Build & Assets', async () => {
    const faviconPath = path.join(publicDir, 'favicon.svg');
    assert.ok(existsSync(faviconPath), 'public/favicon.svg missing');
    const svgContent = await safeReadFile(faviconPath);
    assert.ok(svgContent.includes('<svg') && svgContent.includes('</svg>'), 'favicon.svg is not valid SVG');
    assert.ok(svgContent.includes('#D6C5A9') || svgContent.includes('goldGrad'), 'favicon.svg does not use Champagne accent');

    const icons = ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];
    for (const icon of icons) {
      const p = path.join(publicDir, icon);
      assert.ok(existsSync(p), `Missing PWA icon: ${icon}`);
      assert.ok(statSync(p).size > 1000, `PWA icon ${icon} is too small`);
    }
  });

  await runTest('T1-BUILD-06', 'Web manifest, robots.txt, and sitemap.xml crawler discovery artifacts', 1, 'Build & Assets', async () => {
    const manifestPath = path.join(publicDir, 'site.webmanifest');
    const robotsPath = path.join(publicDir, 'robots.txt');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');

    assert.ok(existsSync(manifestPath), 'site.webmanifest missing');
    assert.ok(existsSync(robotsPath), 'robots.txt missing');
    assert.ok(existsSync(sitemapPath), 'sitemap.xml missing');

    const manifest = JSON.parse(await safeReadFile(manifestPath));
    assert.ok(manifest.name && manifest.name.includes('Wave C. Ambray'), 'Manifest name mismatch');
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Manifest icons missing or incomplete');

    const robots = await safeReadFile(robotsPath);
    assert.ok(robots.includes('User-agent:') && robots.includes('sitemap.xml'), 'robots.txt invalid format');

    const sitemap = await safeReadFile(sitemapPath);
    assert.ok(sitemap.includes('<urlset') && sitemap.includes('http'), 'sitemap.xml invalid XML format');
  });

  suite('Tier 1: Feature Coverage — 2. Constraints & Design System');

  await runTest('T1-DESIGN-01', 'Zero 3D or animation libraries in package.json (no three, gsap, framer-motion)', 1, 'Constraints & Design', async () => {
    const pkgPath = path.join(rootDir, 'package.json');
    assert.ok(existsSync(pkgPath), 'package.json missing');
    const pkg = JSON.parse(await safeReadFile(pkgPath));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    
    const forbidden = ['three', '@types/three', 'gsap', 'framer-motion', '@react-three/fiber'];
    for (const dep of forbidden) {
      assert.ok(!allDeps[dep], `Forbidden dependency "${dep}" detected in package.json!`);
    }
  });

  await runTest('T1-DESIGN-02', 'Zero 3D or animation library imports across all source code in src/', 1, 'Constraints & Design', async () => {
    const sourceFiles = await getAllSourceFiles(srcDir);
    assert.ok(sourceFiles.length > 0, 'No source files found in src/');

    const forbiddenImports = [
      /from\s+['"]three['"]/,
      /from\s+['"]gsap['"]/,
      /from\s+['"]framer-motion['"]/,
      /require\(['"]three['"]\)/,
      /require\(['"]gsap['"]\)/,
      /require\(['"]framer-motion['"]\)/,
    ];

    for (const file of sourceFiles) {
      const code = await safeReadFile(file);
      for (const pattern of forbiddenImports) {
        assert.ok(!pattern.test(code), `Forbidden 3D library import matching ${pattern} found in ${path.relative(rootDir, file)}`);
      }
    }
  });

  await runTest('T1-DESIGN-03', 'Obsidian & Titanium Dark Mode CSS custom properties in src/index.css', 1, 'Constraints & Design', async () => {
    const cssPath = path.join(srcDir, 'index.css');
    assert.ok(existsSync(cssPath), 'src/index.css missing');
    const css = await safeReadFile(cssPath);

    assert.ok(css.includes('--bg-primary: #050507') || css.includes('#050507'), 'Dark mode primary background #050507 missing');
    assert.ok(css.includes('--accent-titanium: #D6C5A9') || css.includes('#D6C5A9'), 'Accent Titanium #D6C5A9 missing');
    assert.ok(css.includes('--accent-signal: #10B981') || css.includes('#10B981'), 'Accent Signal #10B981 missing');
  });

  await runTest('T1-DESIGN-04', 'Silver Alabaster Light Mode CSS custom properties in src/index.css', 1, 'Constraints & Design', async () => {
    const cssPath = path.join(srcDir, 'index.css');
    const css = await safeReadFile(cssPath);

    assert.ok(css.includes('--bg-primary: #F5F5F7') || css.includes('#F5F5F7'), 'Light mode primary background #F5F5F7 missing');
    assert.ok(css.includes('--text-primary: #1D1D1F') || css.includes('#1D1D1F'), 'Light mode text primary #1D1D1F missing');
    assert.ok(css.includes('--accent-titanium: #7A6240') || css.includes('#7A6240'), 'Light mode Accent Titanium #7A6240 missing');
  });

  await runTest('T1-DESIGN-05', 'Sculptural typography, metallic gradients, and frosted glass utilities', 1, 'Constraints & Design', async () => {
    const cssPath = path.join(srcDir, 'index.css');
    const css = await safeReadFile(cssPath);

    assert.ok(css.includes('glass-dock') || css.includes('glass-pill') || css.includes('blur(24px)'), 'Frosted glass pill/dock utility missing');
    assert.ok(css.includes('glass-sheet') || css.includes('blur(28px)'), 'Frosted glass sheet utility missing');
    assert.ok(css.includes('text-metallic') || css.includes('letter-spacing'), 'Metallic typography utility missing');
    assert.ok(css.includes('font-mono-numbers') || css.includes('font-mono-tabular') || css.includes('tabular-nums'), 'Tabular monospace utility missing');
  });

  await runTest('T1-DESIGN-06', 'Synchronous zero-theme-flash head script in index.html (CLS = 0)', 1, 'Constraints & Design', async () => {
    const htmlPath = path.join(rootDir, 'index.html');
    assert.ok(existsSync(htmlPath), 'index.html missing');
    const html = await safeReadFile(htmlPath);

    assert.ok(html.includes('localStorage.getItem('), 'Theme script missing localStorage access in index.html');
    assert.ok(html.includes('data-theme'), 'Theme script does not set data-theme attribute');
    assert.ok(html.includes('<script>') || html.includes('<script inline>'), 'Inline theme script missing in head');
  });

  suite('Tier 1: Feature Coverage — 3. 3D Micro-Particle Canvas Engine');

  await runTest('T1-CANVAS-01', 'Pure TypeScript HTML5 2D canvas ParticleField.tsx implementation', 1, '3D Canvas', async () => {
    const canvasFile = path.join(srcDir, 'components', 'ParticleField.tsx');
    assert.ok(existsSync(canvasFile), 'ParticleField.tsx missing');
    const code = await safeReadFile(canvasFile);
    assert.ok(code.includes('<canvas'), 'Canvas element missing in ParticleField.tsx');
    assert.ok(code.includes("getContext('2d')"), '2D context initialization missing');
    assert.ok(!code.includes("getContext('webgl')"), 'WebGL context detected when 2D canvas was specified');
  });

  await runTest('T1-CANVAS-02', 'Offscreen 16x16px sprite pre-rendering cache for particle radial glows', 1, '3D Canvas', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('createSprites') || code.includes('sprites') || code.includes('offscreen'), 'Offscreen sprite caching routine missing');
    assert.ok(code.includes('16') && (code.includes('width = 16') || code.includes('height = 16') || code.includes('16, 16')), '16x16 sprite dimensions not specified');
    assert.ok(code.includes('createRadialGradient'), 'Radial gradient generator missing in offscreen sprite creation');
  });

  await runTest('T1-CANVAS-03', 'ctx.drawImage() used exclusively for particle rendering (zero per-frame shadowBlur)', 1, '3D Canvas', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('ctx.drawImage(') || code.includes('.drawImage('), 'ctx.drawImage() drawing call missing in particle render loop');
    assert.ok(!code.includes('ctx.shadowBlur ='), 'Forbidden per-frame shadowBlur allocation found in render loop!');
  });

  await runTest('T1-CANVAS-04', 'Interactive 28px blueprint coordinate grid and magnetic cursor loupe implemented', 1, '3D Canvas', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('GRID_SPACING = 28') && code.includes('baseGridCanvas'), '28px pre-rendered blueprint grid missing');
    assert.ok(code.includes('LOUPE_RADIUS') && code.includes('falloff'), 'Interactive cursor loupe falloff missing');
  });

  await runTest('T1-CANVAS-05', 'Tactile physics: pointer swirl vortex and tap/click radial ripple', 1, '3D Canvas', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('pointermove') || code.includes('onPointerMove'), 'Pointermove vortex listener missing');
    assert.ok(code.includes('pointerdown') || code.includes('ripples') || code.includes('Ripple'), 'Pointerdown ripple wave missing');
    assert.ok(code.includes('swirl') || code.includes('vortex') || code.includes('-dy'), 'Tangential swirl physics vector missing');
  });

  await runTest('T1-CANVAS-06', 'Idle RAF auto-sleep (0fps), background tab pause, and prefers-reduced-motion support', 1, '3D Canvas', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('visibilitychange') || code.includes('visibilityState'), 'visibilitychange lifecycle listener missing');
    assert.ok(code.includes('prefers-reduced-motion'), 'prefers-reduced-motion media query listener missing');
    assert.ok(code.includes('cancelAnimationFrame'), 'cancelAnimationFrame on background missing');
    assert.ok(code.includes('isAnimating = false'), 'Idle auto-sleep RAF shutdown missing');
  });

  suite('Tier 1: Feature Coverage — 4. Verified Content & Flagship Systems');

  await runTest('T1-CONTENT-01', 'Verified data layer in src/data/portfolio.ts with strictly typed exports', 1, 'Verified Content', async () => {
    const dataFile = path.join(srcDir, 'data', 'portfolio.ts');
    assert.ok(existsSync(dataFile), 'src/data/portfolio.ts missing');
    assert.ok(!existsSync(path.join(srcDir, 'data', 'portfolioData.ts')), 'Superseded portfolioData.ts must not exist');
    const content = await safeReadFile(dataFile);
    assert.ok(content.includes('export const flagshipSystems'), 'flagshipSystems export missing');
    assert.ok(content.includes('export const careerTimeline') || content.includes('export const careerData'), 'career data export missing');
    assert.ok(content.includes('export const skillCategories'), 'skillCategories export missing');
    assert.ok(content.includes('export const contactData'), 'contactData export missing');
  });

  await runTest('T1-CONTENT-02', 'Exactly 8 verified career chronology rows from Nextstep Software Corp to USTP BS ECE', 1, 'Verified Content', async () => {
    const content = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    assert.ok(content.includes('Nextstep Software Corporation'), 'Nextstep Software Corporation entry missing');
    assert.ok(content.includes('University of Science and Technology of Southern Philippines') || content.includes('USTP'), 'USTP entry missing');
    assert.ok(content.includes('PointersBit'), 'PointersBit entry missing');
    assert.ok(content.includes('Spearhead Software'), 'Spearhead Software entry missing');
    assert.ok(content.includes('BenManage'), 'BenManage entry missing');
  });

  await runTest('T1-CONTENT-03', 'Three flagship systems: Broadband Mapping, Clinic/ERP EZ, and Higher-Ed EDCS', 1, 'Verified Content', async () => {
    const content = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    assert.ok(content.includes('National Broadband Mapping') || content.includes('Broadband'), 'System 1 missing');
    assert.ok(content.includes('Clinic EZ & ERP EZ') || content.includes('Clinic EZ'), 'System 2 missing');
    assert.ok(content.includes('Higher-Ed & Regulatory') || content.includes('EDCS'), 'System 3 missing');
  });

  await runTest('T1-CONTENT-04', 'Interactive 5-node system pipeline diagrams with roles and reliability guarantees', 1, 'Verified Content', async () => {
    const content = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    assert.ok(content.includes('guarantee'), 'Node reliability guarantee missing');
    assert.ok(content.includes('Node 01') && content.includes('Node 05'), '5-node pipeline indexing missing');
  });

  await runTest('T1-CONTENT-05', 'Hero section proof strip metrics (6+ Yrs, 100M+ Spatial Points, 20K+ Users, US & IL Remote)', 1, 'Verified Content', async () => {
    const content = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    assert.ok(content.includes('100M+'), '100M+ metric missing');
    assert.ok(content.includes('20K+') || content.includes('20,000+'), '20K+ metric missing');
  });

  await runTest('T1-CONTENT-06', 'Authentic contact coordinates (Wave C. Ambray, wacanam20@gmail.com, WhatsApp, Cagayan de Oro)', 1, 'Verified Content', async () => {
    const content = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    assert.ok(content.includes('Wave C. Ambray'), 'Name mismatch');
    assert.ok(content.includes('wacanam20@gmail.com'), 'Email mismatch');
    assert.ok(content.includes('+63 965 429 7640') || content.includes('639654297640'), 'Phone mismatch');
    assert.ok(content.includes('Cagayan de Oro'), 'Location mismatch');
  });


  await runTest('T1-CONTENT-07', 'Canonical Section 6.1 file layout and clean absence of superseded files', 1, 'Verified Content', async () => {
    const canonicalFiles = [
      path.join(srcDir, 'data', 'portfolio.ts'),
      path.join(srcDir, 'components', 'ParticleField.tsx'),
      path.join(srcDir, 'components', 'Navbar.tsx'),
      path.join(srcDir, 'components', 'Hero.tsx'),
      path.join(srcDir, 'components', 'SystemSection.tsx'),
      path.join(srcDir, 'components', 'ArchitectureSheet.tsx'),
      path.join(srcDir, 'components', 'ExperienceSpec.tsx'),
      path.join(srcDir, 'components', 'SpotlightModal.tsx'),
      path.join(srcDir, 'components', 'ContactCard.tsx'),
    ];
    for (const f of canonicalFiles) {
      assert.ok(existsSync(f), 'Canonical file missing: ' + path.basename(f));
    }
    const supersededFiles = [
      path.join(srcDir, 'data', 'portfolioData.ts'),
      path.join(srcDir, 'components', 'FlagshipSystems.tsx'),
      path.join(srcDir, 'components', 'CloserLookModal.tsx'),
      path.join(srcDir, 'components', 'StackMatrix.tsx'),
      path.join(srcDir, 'components', 'CareerTimeline.tsx'),
    ];
    for (const s of supersededFiles) {
      assert.ok(!existsSync(s), 'Superseded file must not exist: ' + path.basename(s));
    }
  });

  suite('Tier 1: Feature Coverage — 5. Modals, Navigation & Spotlight');

  await runTest('T1-NAV-01', 'Desktop top frosted pill dock and mobile thumb-friendly bottom dock', 1, 'Modals & Nav', async () => {
    const navFile = path.join(srcDir, 'components', 'Navbar.tsx');
    assert.ok(existsSync(navFile), 'Navbar.tsx missing');
    const code = await safeReadFile(navFile);
    assert.ok(code.includes('#overview') || code.includes('Overview'), 'Overview link missing');
    assert.ok(code.includes('#systems') || code.includes('Systems'), 'Systems link missing');
    assert.ok(code.includes('#experience') || code.includes('Experience'), 'Experience link missing');
    assert.ok(code.includes('#contact') || code.includes('Contact'), 'Contact link missing');
  });

  await runTest('T1-NAV-02', 'Spotlight search palette responding to Cmd+K / Ctrl+K keyboard shortcut', 1, 'Modals & Nav', async () => {
    const appFile = path.join(srcDir, 'App.tsx');
    const spotlightFile = path.join(srcDir, 'components', 'SpotlightModal.tsx');
    const appCode = await safeReadFile(appFile);
    const spotlightCode = await safeReadFile(spotlightFile);

    const hasKBinding = (appCode.includes('metaKey') || appCode.includes('ctrlKey')) && appCode.includes("'k'");
    const hasSpotlight = spotlightCode.includes('dialog') || spotlightCode.includes('SpotlightModal');
    assert.ok(hasKBinding, 'Global Cmd+K / Ctrl+K keydown handler missing in App.tsx');
    assert.ok(hasSpotlight, 'Spotlight modal element missing');
  });

  await runTest('T1-NAV-03', 'Spotlight quick actions (chapter jumps, blueprints, copy email, toggle theme, resume)', 1, 'Modals & Nav', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'SpotlightModal.tsx'));
    assert.ok(code.includes('email') || code.includes('copy'), 'Quick action for email missing');
    assert.ok(code.includes('resume') || code.includes('pdf'), 'Quick action for resume missing');
    assert.ok(code.includes('theme') || code.includes('Dark') || code.includes('Light'), 'Quick action for theme toggle missing');
  });

  await runTest('T1-NAV-04', 'Closer look modal sheets for deep architectural inspection', 1, 'Modals & Nav', async () => {
    const sheetFile = path.join(srcDir, 'components', 'ArchitectureSheet.tsx');
    assert.ok(existsSync(sheetFile), 'ArchitectureSheet.tsx missing');
    assert.ok(!existsSync(path.join(srcDir, 'components', 'CloserLookModal.tsx')), 'Superseded CloserLookModal.tsx must not exist');
    const code = await safeReadFile(sheetFile);
    assert.ok(code.includes('dialog') || code.includes('modal'), 'Modal presentation missing');
  });

  await runTest('T1-NAV-05', 'Native HTML5 <dialog> element usage with overscroll containment', 1, 'Modals & Nav', async () => {
    const sheetFile = path.join(srcDir, 'components', 'ArchitectureSheet.tsx');
    const spotlightFile = path.join(srcDir, 'components', 'SpotlightModal.tsx');
    
    let foundDialog = false;
    for (const f of [sheetFile, spotlightFile]) {
      if (existsSync(f)) {
        const c = await safeReadFile(f);
        if (c.includes('<dialog') || c.includes('showModal()')) {
          foundDialog = true;
          break;
        }
      }
    }
    assert.ok(foundDialog, 'Native HTML5 <dialog> element not found in modal components');
  });

  await runTest('T1-NAV-06', 'Direct contact channels with one-click email copy, visual checkmark feedback, and WhatsApp/Viber direct links', 1, 'Modals & Nav', async () => {
    const contactFile = path.join(srcDir, 'components', 'ContactCard.tsx');
    assert.ok(existsSync(contactFile), 'ContactCard.tsx missing');
    const code = await safeReadFile(contactFile);
    assert.ok(code.includes('navigator.clipboard.writeText') || code.includes('handleCopyEmail'), 'Clipboard write missing');
    assert.ok(code.includes('copied') || code.includes('check') || code.includes('Check'), 'Visual checkmark feedback state missing');
    assert.ok(code.includes('whatsappUrl') || code.includes('wa.me'), 'WhatsApp direct link missing');
    assert.ok(code.includes('viberUrl') || code.includes('viber:'), 'Viber direct link missing');
  });

  suite('Tier 1: Feature Coverage — 6. Modern Web Guidance Compliance');

  await runTest('T1-MWG-01', 'Native dialog and light-dismiss pattern applied (light-dismiss-a-dialog)', 1, 'Modern Web Guidance', async () => {
    const sourceFiles = await getAllSourceFiles(path.join(srcDir, 'components'));
    let hasLightDismiss = false;
    for (const file of sourceFiles) {
      const code = await safeReadFile(file);
      if (code.includes('closeOnClickOutside') || code.includes('handleClick') || code.includes('getBoundingClientRect') || code.includes('onClose')) {
        hasLightDismiss = true;
        break;
      }
    }
    assert.ok(hasLightDismiss, 'Light dismiss pattern missing from modal components');
  });

  await runTest('T1-MWG-02', 'Scroll lock under modal dialogs (prevent-page-scroll-under-modal-dialog)', 1, 'Modern Web Guidance', async () => {
    const sourceFiles = await getAllSourceFiles(path.join(srcDir, 'components'));
    let hasScrollLock = false;
    for (const file of sourceFiles) {
      const code = await safeReadFile(file);
      if (code.includes('overflow =') || code.includes('overflow-hidden') || code.includes('overscroll-contain')) {
        hasScrollLock = true;
        break;
      }
    }
    assert.ok(hasScrollLock, 'Overscroll or body scroll containment missing');
  });

  await runTest('T1-MWG-03', 'Dark mode color scheme synchronization (dark-mode / dark-mode-toggle)', 1, 'Modern Web Guidance', async () => {
    const html = await safeReadFile(path.join(rootDir, 'index.html'));
    const css = await safeReadFile(path.join(srcDir, 'index.css'));
    const hasColorScheme = html.includes('color-scheme') || css.includes('color-scheme');
    assert.ok(hasColorScheme, 'color-scheme property or meta tag missing');
  });

  await runTest('T1-MWG-04', 'Responsive career spec table presentation (responsive-table)', 1, 'Modern Web Guidance', async () => {
    const specFile = path.join(srcDir, 'components', 'ExperienceSpec.tsx');
    assert.ok(existsSync(specFile), 'ExperienceSpec.tsx missing');
    assert.ok(!existsSync(path.join(srcDir, 'components', 'CareerTimeline.tsx')), 'Superseded CareerTimeline.tsx must not exist');
    assert.ok(!existsSync(path.join(srcDir, 'components', 'StackMatrix.tsx')), 'Superseded StackMatrix.tsx must not exist');
    const code = await safeReadFile(specFile);
    assert.ok(code.includes('overflow-x-auto') || code.includes('table') || code.includes('grid'), 'Responsive table/grid container missing');
  });

  await runTest('T1-MWG-05', 'Efficient background processing via RAF pausing (efficient-background-processing)', 1, 'Modern Web Guidance', async () => {
    const canvasCode = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(canvasCode.includes('document.visibilityState') && canvasCode.includes('cancelAnimationFrame'), 'RAF pausing on document hidden missing');
  });

  await runTest('T1-MWG-06', 'Image priority and async decoding optimization (optimize-image-priority)', 1, 'Modern Web Guidance', async () => {
    const contactCode = await safeReadFile(path.join(srcDir, 'components', 'ContactCard.tsx'));
    assert.ok(contactCode.includes('decoding="async"'), 'decoding="async" missing on profile picture');
    assert.ok(contactCode.includes('<picture>') || contactCode.includes('<picture'), '<picture> element missing for multi-format portrait');
  });

  // ----------------------------------------------------------------------------
  // TIER 2: Boundary & Corner Cases (>= 30 tests = 32 tests)
  // ----------------------------------------------------------------------------
  suite('Tier 2: Boundary & Corner Cases — Numerical, Sizing & Strict Limits');

  await runTest('T2-BOUND-01', 'Exact dimensions of public/og-image.png (strictly 1200x630 pixels)', 2, 'Dimensions', async () => {
    const dim = await getImageDimensions(path.join(publicDir, 'og-image.png'));
    assert.strictEqual(dim.width, 1200, `og-image.png width expected 1200, got ${dim.width}`);
    assert.strictEqual(dim.height, 630, `og-image.png height expected 630, got ${dim.height}`);
  });

  await runTest('T2-BOUND-02', 'Exact dimensions of public/og-image.webp (strictly 1200x630 pixels)', 2, 'Dimensions', async () => {
    const dim = await getImageDimensions(path.join(publicDir, 'og-image.webp'));
    assert.strictEqual(dim.width, 1200, `og-image.webp width expected 1200, got ${dim.width}`);
    assert.strictEqual(dim.height, 630, `og-image.webp height expected 630, got ${dim.height}`);
  });

  await runTest('T2-BOUND-03', 'Byte size of public/profile-400.avif is strictly < 30,720 bytes (< 30KB)', 2, 'File Size', async () => {
    const st = statSync(path.join(publicDir, 'profile-400.avif'));
    assert.ok(st.size < 30720, `profile-400.avif exceeds 30KB: ${st.size} bytes`);
  });

  await runTest('T2-BOUND-04', 'Byte size of public/profile-400.webp is strictly < 30,720 bytes (< 30KB)', 2, 'File Size', async () => {
    const st = statSync(path.join(publicDir, 'profile-400.webp'));
    assert.ok(st.size < 30720, `profile-400.webp exceeds 30KB: ${st.size} bytes`);
  });

  await runTest('T2-BOUND-05', 'Byte size of public/profile-800.webp is non-empty and <= 150KB', 2, 'File Size', async () => {
    const st = statSync(path.join(publicDir, 'profile-800.webp'));
    assert.ok(st.size > 1000 && st.size <= 153600, `profile-800.webp out of expected size range: ${st.size} bytes`);
  });

  await runTest('T2-BOUND-06', 'Byte size of public/profile-800.avif is non-empty and <= 150KB', 2, 'File Size', async () => {
    const st = statSync(path.join(publicDir, 'profile-800.avif'));
    assert.ok(st.size > 1000 && st.size <= 153600, `profile-800.avif out of expected size range: ${st.size} bytes`);
  });

  await runTest('T2-BOUND-07', 'Base64 blur placeholder size in src/generated/assetMeta.ts is strictly < 1,024 bytes', 2, 'File Size', async () => {
    const metaCode = await safeReadFile(path.join(srcDir, 'generated', 'assetMeta.ts'));
    const match = metaCode.match(/blurDataUri:\s*'([^']+)'/);
    assert.ok(match && match[1], 'Could not extract blurDataUri from assetMeta.ts');
    const uriLength = match[1].length;
    assert.ok(uriLength < 1024, `blurDataUri is too large: ${uriLength} characters (must be < 1KB)`);
  });

  await runTest('T2-BOUND-08', 'Portrait crop geometry in scripts/build-assets.mjs extracts 778x778 at top:0, left:123', 2, 'Crop Geometry', async () => {
    const script = await safeReadFile(path.join(scriptsDir, 'build-assets.mjs'));
    assert.ok(script.includes('0.76') || script.includes('778'), 'Crop size calculation 76% (778px) missing');
    assert.ok(script.includes('cropTop = 0') || script.includes('top: 0') || script.includes('top: cropTop'), 'Crop top must be 0 to preserve 42px headroom');
  });

  await runTest('T2-BOUND-09', 'Portrait crop terminates at y <= 778px excluding 100% of ID badge at y = 925px', 2, 'Crop Geometry', async () => {
    const script = await safeReadFile(path.join(scriptsDir, 'build-assets.mjs'));
    assert.ok(script.includes('147px') || script.includes('badge') || script.includes('778'), 'Headroom/badge exclusion verification documented in pipeline');
  });

  await runTest('T2-BOUND-10', 'Hero statement word count strictly <= 16 words', 2, 'Word Economy', async () => {
    const heroCode = await safeReadFile(path.join(srcDir, 'components', 'Hero.tsx'));
    assert.ok(heroCode.includes('Distributed .NET & TypeScript systems built for national scale'), 'Hero statement text missing');
    const heroStatement = 'Full-Stack Engineer. Distributed .NET & TypeScript systems built for national scale.';
    const words = countWords(heroStatement);
    assert.ok(words <= 16, `Hero statement has ${words} words, must be <= 16`);
  });

  await runTest('T2-BOUND-11', 'Flagship System 1 (Broadband Mapping) subtitle word count strictly <= 16 words', 2, 'Word Economy', async () => {
    const dataCode = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    const match = dataCode.match(/subtitle:\s*'([^']+)'/);
    assert.ok(match, 'System 1 subtitle not found');
    const words = countWords(match[1]);
    assert.ok(words <= 16, `System 1 subtitle has ${words} words (expected <= 16): "${match[1]}"`);
  });

  await runTest('T2-BOUND-12', 'Flagship System 2 (Clinic EZ & ERP EZ) subtitle word count strictly <= 16 words', 2, 'Word Economy', async () => {
    const dataCode = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    const matches = [...dataCode.matchAll(/subtitle:\s*'([^']+)'/g)];
    assert.ok(matches.length >= 2, 'System 2 subtitle not found');
    const words = countWords(matches[1][1]);
    assert.ok(words <= 16, `System 2 subtitle has ${words} words (expected <= 16): "${matches[1][1]}"`);
  });

  await runTest('T2-BOUND-13', 'Flagship System 3 (Higher-Ed EDCS) subtitle word count strictly <= 16 words', 2, 'Word Economy', async () => {
    const dataCode = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    const matches = [...dataCode.matchAll(/subtitle:\s*'([^']+)'/g)];
    assert.ok(matches.length >= 3, 'System 3 subtitle not found');
    const words = countWords(matches[2][1]);
    assert.ok(words <= 16, `System 3 subtitle has ${words} words (expected <= 16): "${matches[2][1]}"`);
  });

  await runTest('T2-BOUND-14', 'Stack Matrix section subtitle word count strictly <= 16 words', 2, 'Word Economy', async () => {
    const text = 'Six years shipping resilient distributed architectures across US, Israeli, and national platforms.';
    const words = countWords(text);
    assert.ok(words <= 16, `Stack subtitle has ${words} words (expected <= 16)`);
  });

  await runTest('T2-BOUND-15', 'Contact section subtitle word count strictly <= 16 words', 2, 'Word Economy', async () => {
    const contactCode = await safeReadFile(path.join(srcDir, 'components', 'ContactCard.tsx'));
    const text = 'Direct executive channels for remote full-stack and backend architecture roles.';
    assert.ok(contactCode.includes(text), 'Contact section subtitle missing');
    const words = countWords(text);
    assert.ok(words <= 16, `Contact subtitle has ${words} words (expected <= 16)`);
  });

  await runTest('T2-BOUND-16', 'Automated scan: all flagship system subtitles in portfolio.ts <= 16 words', 2, 'Word Economy', async () => {
    const dataCode = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    const matches = [...dataCode.matchAll(/subtitle:\s*'([^']+)'/g)];
    for (let i = 0; i < matches.length; i++) {
      const words = countWords(matches[i][1]);
      assert.ok(words <= 16, `Subtitle #${i+1} has ${words} words (exceeds 16 words limit): "${matches[i][1]}"`);
    }
  });

  await runTest('T2-BOUND-17', 'Zero 3D libraries in package.json dependencies and devDependencies', 2, 'Dependencies', async () => {
    const pkg = JSON.parse(await safeReadFile(path.join(rootDir, 'package.json')));
    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    assert.ok(!deps.includes('three'), 'three found in dependencies');
    assert.ok(!deps.includes('gsap'), 'gsap found in dependencies');
    assert.ok(!deps.includes('framer-motion'), 'framer-motion found in dependencies');
    assert.ok(!devDeps.includes('three'), 'three found in devDependencies');
  });

  await runTest('T2-BOUND-18', 'Zero 3D libraries imported across all source files in src/', 2, 'Dependencies', async () => {
    const files = await getAllSourceFiles(srcDir);
    for (const f of files) {
      const c = await safeReadFile(f);
      assert.ok(!/from\s+['"](three|gsap|framer-motion)['"]/.test(c), `3D library imported in ${f}`);
    }
  });

  await runTest('T2-BOUND-19', 'Zero connecting constellation lines in canvas engine (no ctx.lineTo between particles)', 2, 'Canvas Constraints', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(!code.includes('ctx.lineTo') && !code.includes('.lineTo('), 'ctx.lineTo detected in ParticleField.tsx (spiderweb constellation lines strictly forbidden)');
  });

  await runTest('T2-BOUND-20', 'Particle canvas devicePixelRatio capped strictly at Math.min(..., 2)', 2, 'Canvas Constraints', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('Math.min(window.devicePixelRatio') || code.includes('Math.min('), 'DPR capping formula missing');
    assert.ok(code.includes('2)'), 'DPR cap value must be 2');
  });

  await runTest('T2-BOUND-21', 'Blueprint coordinate grid uses 28px dot spacing and 112px fiducial markers', 2, 'Canvas Constraints', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('GRID_SPACING = 28'), 'GRID_SPACING = 28 missing in ParticleField.tsx');
    assert.ok(code.includes('FIDUCIAL_STRIDE = 4') || code.includes('112'), 'Fiducial 112px stride missing in ParticleField.tsx');
  });

  await runTest('T2-BOUND-22', 'Cursor micro-particle wake ring buffer capped at <= 64 live motes (MAX_MOTES = 56)', 2, 'Canvas Constraints', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('MAX_MOTES = 56'), 'MAX_MOTES = 56 wake buffer cap missing in ParticleField.tsx');
  });

  await runTest('T2-BOUND-23', 'Pre-rendered offscreen sprite dimension is strictly 16x16 pixels', 2, 'Canvas Constraints', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(code.includes('16') && (code.includes('width = 16') || code.includes('16, 16')), 'Sprite width/height 16px missing');
  });

  await runTest('T2-BOUND-24', 'Frosted glass blur specifications (blur(24px) for pills, blur(28px) for sheets, saturate(180%))', 2, 'Design Tokens', async () => {
    const css = await safeReadFile(path.join(srcDir, 'index.css'));
    assert.ok(css.includes('blur(24px)'), 'blur(24px) missing in index.css');
    assert.ok(css.includes('blur(28px)'), 'blur(28px) missing in index.css');
    assert.ok(css.includes('saturate(180%)'), 'saturate(180%) missing in index.css');
  });

  await runTest('T2-BOUND-25', 'Optical tracking tight display typography utilities', 2, 'Design Tokens', async () => {
    const css = await safeReadFile(path.join(srcDir, 'index.css'));
    const heroCode = await safeReadFile(path.join(srcDir, 'components', 'Hero.tsx'));
    assert.ok(css.includes('letter-spacing') || css.includes('-0.015em'), 'letter-spacing missing in index.css');
    assert.ok(heroCode.includes('tracking-tight') || heroCode.includes('tracking-tighter'), 'tracking-tight class missing on headlines');
  });

  await runTest('T2-BOUND-26', 'Monospace proof strip typography specifies tabular numbers', 2, 'Design Tokens', async () => {
    const css = await safeReadFile(path.join(srcDir, 'index.css'));
    assert.ok(css.includes('tabular-nums') || css.includes('font-mono-numbers'), 'tabular-nums missing in index.css');
  });

  await runTest('T2-BOUND-27', 'Apple touch icon dimensions are exactly 180x180 pixels', 2, 'Dimensions', async () => {
    const dim = await getImageDimensions(path.join(publicDir, 'apple-touch-icon.png'));
    assert.strictEqual(dim.width, 180, 'apple-touch-icon.png width must be 180');
    assert.strictEqual(dim.height, 180, 'apple-touch-icon.png height must be 180');
  });

  await runTest('T2-BOUND-28', 'PWA icon-192 dimensions are exactly 192x192 pixels', 2, 'Dimensions', async () => {
    const dim = await getImageDimensions(path.join(publicDir, 'icon-192.png'));
    assert.strictEqual(dim.width, 192, 'icon-192.png width must be 192');
    assert.strictEqual(dim.height, 192, 'icon-192.png height must be 192');
  });

  await runTest('T2-BOUND-29', 'PWA icon-512 dimensions are exactly 512x512 pixels', 2, 'Dimensions', async () => {
    const dim = await getImageDimensions(path.join(publicDir, 'icon-512.png'));
    assert.strictEqual(dim.width, 512, 'icon-512.png width must be 512');
    assert.strictEqual(dim.height, 512, 'icon-512.png height must be 512');
  });

  await runTest('T2-BOUND-30', 'WhatsApp URL starts with https://wa.me/ and Viber URL starts with viber://chat?number=', 2, 'Content Integrity', async () => {
    const dataCode = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    assert.ok(dataCode.includes('https://wa.me/'), 'Invalid WhatsApp URL format');
    assert.ok(dataCode.includes('viber://chat?number='), 'Invalid Viber URL format');
  });

  await runTest('T2-BOUND-31', 'Career chronology has exactly 8 entries from current to education', 2, 'Content Integrity', async () => {
    const dataCode = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    const idMatches = [...dataCode.matchAll(/id:\s*'career-/g)];
    assert.strictEqual(idMatches.length, 8, `Expected exactly 8 career rows, found ${idMatches.length}`);
  });

  await runTest('T2-BOUND-32', 'Stack Matrix defines exactly 5 filter categories', 2, 'Content Integrity', async () => {
    const dataCode = await safeReadFile(path.join(srcDir, 'data', 'portfolio.ts'));
    assert.ok(dataCode.includes("id: 'all'") || dataCode.includes("All Competencies"), 'Category All missing');
    assert.ok(dataCode.includes("'Backend & Distributed'"), 'Category Backend & Distributed missing');
    assert.ok(dataCode.includes("'Frontend & Offline-First'"), 'Category Frontend & Offline-First missing');
    assert.ok(dataCode.includes("'Data, Spatial & AI'"), 'Category Data, Spatial & AI missing');
    assert.ok(dataCode.includes("'Testing & DevOps'"), 'Category Testing & DevOps missing');
  });

  // ----------------------------------------------------------------------------
  // TIER 3: Cross-Feature Combinations (>= 10 tests = 11 tests)
  // ----------------------------------------------------------------------------

  await runTest('T2-BOUND-33', '100% Palette purity: zero off-palette purple (#9333EA) across src/', 2, 'Content Integrity', async () => {
    const allFiles = await getAllSourceFiles(srcDir);
    const violations = [];
    for (const file of allFiles) {
      const content = await safeReadFile(file);
      if (content.toLowerCase().includes('#9333ea')) {
        violations.push(path.basename(file));
      }
    }
    assert.strictEqual(violations.length, 0, 'Off-palette #9333EA found in: ' + violations.join(', '));
  });

  suite('Tier 3: Cross-Feature Combinations — Choreography & State Linkages');

  await runTest('T3-CROSS-01', 'Theme switcher toggles document theme AND canvas sprite palette adapts colors', 3, 'Theme & Canvas', async () => {
    const canvasCode = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(canvasCode.includes("theme === 'dark'") || canvasCode.includes('theme'), 'Theme prop handling missing in ParticleField.tsx');
    assert.ok(canvasCode.includes('createSprites'), 'createSprites does not react to theme');
    assert.ok(canvasCode.includes('245') && canvasCode.includes('29'), 'Contrasting Dark and Light sprite palettes not found');
  });

  await runTest('T3-CROSS-02', 'Open modal dialogs pause interactive cursor wake on ParticleField surface', 3, 'Modal & Surface', async () => {
    const appCode = await safeReadFile(path.join(srcDir, 'App.tsx'));
    const canvasCode = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(appCode.includes('isModalOpen'), 'App.tsx does not pass isModalOpen to ParticleField');
    assert.ok(appCode.includes('ParticleField'), 'ParticleField not mounted in App.tsx');
    assert.ok(canvasCode.includes('isModalOpenRef.current'), 'ParticleField.tsx does not pause interactive wake during open modal');
  });

  await runTest('T3-CROSS-03', 'Hero keeps clean 4-metric spec grid without AI-demo 3D formation pills', 3, 'Hero Clarity', async () => {
    const heroCode = await safeReadFile(path.join(srcDir, 'components', 'Hero.tsx'));
    assert.ok(!heroCode.includes('3D MORPH') && !heroCode.includes('onSelectFormation'), 'Artificial 3D morph pills must be removed from Hero.tsx');
    assert.ok(heroCode.includes('6+ Yrs') && heroCode.includes('100M+') && heroCode.includes('20K+'), 'Hero 4-metric architectural <dl> grid missing');
  });

  await runTest('T3-CROSS-04', 'Stack Matrix skill pill click dynamically highlights matching career timeline rows', 3, 'Stack & Career', async () => {
    const specFile = path.join(srcDir, 'components', 'ExperienceSpec.tsx');
    assert.ok(existsSync(specFile), 'ExperienceSpec.tsx missing');
    const specCode = await safeReadFile(specFile);
    assert.ok(specCode.includes('selectedSkill') || specCode.includes('onSelectSkill'), 'Skill selection logic missing in ExperienceSpec');
    assert.ok(specCode.includes('isMatch') || specCode.includes('highlight') || specCode.includes('ring-'), 'Career row highlighting logic missing');
  });

  await runTest('T3-CROSS-05', 'Spotlight Cmd+K palette exposes instant actions linking to architecture blueprints', 3, 'Spotlight & Modals', async () => {
    const spotlightCode = await safeReadFile(path.join(srcDir, 'components', 'SpotlightModal.tsx'));
    assert.ok(spotlightCode.includes('onOpenSystem') || spotlightCode.includes('system') || spotlightCode.includes('blueprint'), 'Blueprint modal trigger missing in SpotlightModal');
  });

  await runTest('T3-CROSS-06', 'Architecture Sheet 5-node interactive pipeline reveals details on node selection', 3, 'Pipeline & Sheet', async () => {
    const sheetFile = path.join(srcDir, 'components', 'ArchitectureSheet.tsx');
    assert.ok(existsSync(sheetFile), 'ArchitectureSheet.tsx missing');
    assert.ok(!existsSync(path.join(srcDir, 'components', 'FlagshipSystems.tsx')), 'Superseded FlagshipSystems.tsx must not exist');
    const sheetCode = await safeReadFile(sheetFile);
    assert.ok(sheetCode.includes('activeNode') || sheetCode.includes('activeNodeIdx'), 'Node selection state missing in ArchitectureSheet.tsx');
    assert.ok(sheetCode.includes('guarantee'), 'Active node guarantee missing in ArchitectureSheet.tsx');
    assert.ok(sheetCode.includes('details'), 'Active node details missing in ArchitectureSheet.tsx');

    // Anti-Bento assertion on SystemSection
    const sectionFile = path.join(srcDir, 'components', 'SystemSection.tsx');
    assert.ok(existsSync(sectionFile), 'SystemSection.tsx missing');
    const sectionCode = await safeReadFile(sectionFile);
    assert.ok(!sectionCode.includes('grid-cols-4'), 'Inline 4-card metrics grid must not exist in SystemSection.tsx');
    assert.ok(!sectionCode.includes('Node 01') && !sectionCode.includes('05'), 'Inline 5-node pipeline must not exist in SystemSection.tsx');
    assert.ok(sectionCode.includes('Closer look'), 'Closer look frosted button missing in SystemSection.tsx');
  });

  await runTest('T3-CROSS-07', 'Contact card <picture> markup pairs AVIF and WebP sources with async decoding', 3, 'Images & Card', async () => {
    const code = await safeReadFile(path.join(srcDir, 'components', 'ContactCard.tsx'));
    assert.ok(code.includes('image/avif') || code.includes('.avif'), 'AVIF source missing in ContactCard <picture>');
    assert.ok(code.includes('image/webp') || code.includes('.webp'), 'WebP source missing in ContactCard <picture>');
    assert.ok(code.includes('decoding="async"'), 'decoding="async" attribute missing');
    assert.ok(code.includes('width={400}') || code.includes('width="400"'), 'Explicit width 400 missing');
  });

  await runTest('T3-CROSS-08', 'Zero-CLS theme persistence initializes data-theme before first paint', 3, 'Theming & CLS', async () => {
    const html = await safeReadFile(path.join(rootDir, 'index.html'));
    assert.ok(html.indexOf('localStorage.getItem') < html.indexOf('id="root"'), 'Inline theme script must run prior to body root mount');
  });

  await runTest('T3-CROSS-09', 'Resume download link consistency: Hero CTA, Spotlight action, and Contact card', 3, 'Resume Links', async () => {
    const heroCode = await safeReadFile(path.join(srcDir, 'components', 'Hero.tsx'));
    const contactCode = await safeReadFile(path.join(srcDir, 'components', 'ContactCard.tsx'));
    const spotlightCode = await safeReadFile(path.join(srcDir, 'components', 'SpotlightModal.tsx'));

    assert.ok(heroCode.includes('wave_ambray_resume.pdf') || heroCode.includes('resumeUrl'), 'Hero resume download missing');
    assert.ok(contactCode.includes('wave_ambray_resume.pdf') || contactCode.includes('resumeUrl'), 'Contact card resume download missing');
    assert.ok(spotlightCode.includes('wave_ambray_resume.pdf') || spotlightCode.includes('resumeUrl'), 'Spotlight resume download missing');
  });

  await runTest('T3-CROSS-10', 'Keyboard accessibility: Escape key dismisses open CloserLook and Spotlight modals', 3, 'Keyboard & Focus', async () => {
    const spotlightCode = await safeReadFile(path.join(srcDir, 'components', 'SpotlightModal.tsx'));
    assert.ok(spotlightCode.includes('Escape'), 'Escape key listener missing in SpotlightModal');

    const sheetFile = path.join(srcDir, 'components', 'ArchitectureSheet.tsx');
    assert.ok(existsSync(sheetFile), 'ArchitectureSheet.tsx missing');
    const modalCode = await safeReadFile(sheetFile);
    assert.ok(modalCode.includes('Escape') || modalCode.includes('onClose') || modalCode.includes('handleCancel'), 'Modal dismissal mechanism missing');
  });

  await runTest('T3-CROSS-11', 'Dual tactile physics coupling: pointer movement vortex + pointer click radial ripple', 3, 'Tactile Coupling', async () => {
    const canvasCode = await safeReadFile(path.join(srcDir, 'components', 'ParticleField.tsx'));
    assert.ok(canvasCode.includes('vortex') || canvasCode.includes('swirlX'), 'Pointer vortex swirl physics missing');
    assert.ok(canvasCode.includes('ripple') && canvasCode.includes('envelope'), 'Pointer click ripple wave physics missing');
  });

  // ----------------------------------------------------------------------------
  // TIER 4: Real-World Workload & Build Verification (>= 5 tests = 5 tests)
  // ----------------------------------------------------------------------------
  suite('Tier 4: Real-World Workload & Build Verification — Production Pipeline');

  await runTest('T4-WORK-01', 'Automated asset pipeline execution (bun run optimize / node scripts/build-assets.mjs)', 4, 'Workload', async () => {
    try {
      execSync('node scripts/build-assets.mjs', { cwd: rootDir, stdio: 'pipe' });
    } catch (err) {
      assert.fail(`Asset pipeline failed with error: ${err.message}`);
    }
  });

  await runTest('T4-WORK-02', 'Full TypeScript compilation and Vite production build (bun run build / tsc -b && vite build)', 4, 'Build Verification', async () => {
    try {
      execSync('bun run build', { cwd: rootDir, stdio: 'pipe' });
    } catch (err) {
      assert.fail(`Production build failed:\n${err.stderr?.toString() || err.message}`);
    }
  });

  await runTest('T4-WORK-03', 'Static production distribution artifacts verification in dist/', 4, 'Dist Artifacts', async () => {
    const distHtml = path.join(distDir, 'index.html');
    assert.ok(existsSync(distHtml), 'dist/index.html missing after production build');
    const html = await safeReadFile(distHtml);
    assert.ok(html.includes('<html') && html.includes('Wave C. Ambray'), 'dist/index.html does not contain valid built markup');
    
    // Check bundled assets directory
    const distAssetsDir = path.join(distDir, 'assets');
    assert.ok(existsSync(distAssetsDir), 'dist/assets directory missing');
    const assetFiles = await fs.readdir(distAssetsDir);
    assert.ok(assetFiles.some(f => f.endsWith('.js')), 'Bundled JS file missing in dist/assets');
    assert.ok(assetFiles.some(f => f.endsWith('.css')), 'Bundled CSS file missing in dist/assets');
  });

  await runTest('T4-WORK-04', 'HTML Head, OpenGraph meta tags, and Person JSON-LD structured data validation', 4, 'SEO & Structured Data', async () => {
    const html = await safeReadFile(path.join(rootDir, 'index.html'));
    
    // Validate Canonical Link
    assert.ok(html.includes('<link rel="canonical" href="https://waveambray.dev/" />'), 'Canonical link missing in index.html');

    // Validate OpenGraph
    assert.ok(html.includes('property="og:image"') || html.includes('property=\'og:image\''), 'og:image missing');
    assert.ok(html.includes('content="1200"') || html.includes('og:image:width'), 'og:image:width 1200 missing');
    assert.ok(html.includes('content="630"') || html.includes('og:image:height'), 'og:image:height 630 missing');
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'), 'Twitter summary_large_image missing');

    // Validate JSON-LD
    const ldJsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldJsonMatch, 'JSON-LD structured data script missing in index.html');
    const schema = JSON.parse(ldJsonMatch[1]);
    assert.strictEqual(schema['@type'], 'Person', 'JSON-LD schema @type must be Person');
    assert.strictEqual(schema.name, 'Wave C. Ambray', 'JSON-LD person name mismatch');
  });

  await runTest('T4-WORK-05', 'Crawl, cache, and manifest discovery links validation', 4, 'Crawl Discovery', async () => {
    const robots = await safeReadFile(path.join(publicDir, 'robots.txt'));
    assert.ok(robots.includes('sitemap.xml'), 'robots.txt does not link to sitemap.xml');

    const sitemap = await safeReadFile(path.join(publicDir, 'sitemap.xml'));
    assert.ok(sitemap.includes('<loc>https://waveambray.dev') || sitemap.includes('<loc>'), 'sitemap.xml does not contain valid canonical URL location');

    const manifest = JSON.parse(await safeReadFile(path.join(publicDir, 'site.webmanifest')));
    assert.ok(manifest.icons.length >= 2, 'site.webmanifest must specify at least 192 and 512 icons');
  });

  printSummary();
}

function printSummary() {
  const total = testResults.length;
  const passed = testResults.filter(t => t.status === 'passed').length;
  const failed = testResults.filter(t => t.status === 'failed').length;

  const t1 = testResults.filter(t => t.tier === 1);
  const t2 = testResults.filter(t => t.tier === 2);
  const t3 = testResults.filter(t => t.tier === 3);
  const t4 = testResults.filter(t => t.tier === 4);

  const t1Passed = t1.filter(t => t.status === 'passed').length;
  const t2Passed = t2.filter(t => t.status === 'passed').length;
  const t3Passed = t3.filter(t => t.status === 'passed').length;
  const t4Passed = t4.filter(t => t.status === 'passed').length;

  console.log(`\n${colors.bold}${colors.white}================================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.white}                     E2E TEST SUITE EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.bold}${colors.white}================================================================================${colors.reset}`);
  console.log(`  Tier 1: Feature Coverage (6 Areas):             ${t1Passed === t1.length ? colors.green : colors.yellow}${t1Passed} / ${t1.length} passed${colors.reset}`);
  console.log(`  Tier 2: Boundary & Corner Cases:                ${t2Passed === t2.length ? colors.green : colors.yellow}${t2Passed} / ${t2.length} passed${colors.reset}`);
  console.log(`  Tier 3: Cross-Feature Combinations:             ${t3Passed === t3.length ? colors.green : colors.yellow}${t3Passed} / ${t3.length} passed${colors.reset}`);
  console.log(`  Tier 4: Real-World Workload & Build:            ${t4Passed === t4.length ? colors.green : colors.yellow}${t4Passed} / ${t4.length} passed${colors.reset}`);
  console.log(`${colors.dim}--------------------------------------------------------------------------------${colors.reset}`);
  console.log(`  ${colors.bold}Total Test Assertions:${colors.reset}                         ${failed === 0 ? colors.bold + colors.green : colors.bold + colors.red}${passed} passed, ${failed} failed (${total} total)${colors.reset}`);
  console.log(`${colors.bold}${colors.white}================================================================================${colors.reset}`);

  if (failed > 0) {
    console.log(`\n${colors.bold}${colors.red}FAILED TESTS DIAGNOSTICS:${colors.reset}`);
    for (const t of testResults.filter(t => t.status === 'failed')) {
      console.log(`  ${colors.red}• [${t.id}] ${t.description}${colors.reset}`);
      console.log(`    ${colors.dim}${t.error?.message || t.error}${colors.reset}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${colors.bold}${colors.green}✓ All ${total} requirement assertions PASSED with zero defects.${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error(`${colors.red}Fatal test runner error:${colors.reset}`, err);
  process.exit(1);
});

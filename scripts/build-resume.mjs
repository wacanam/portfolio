import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outPdfPath = path.join(rootDir, 'public', 'wave_ambray_resume.pdf');

const CHROME_CANDIDATES = [
  process.env.CHROME_BIN,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome',
  'chromium',
].filter(Boolean);

async function resolveChromeBinary() {
  for (const candidate of CHROME_CANDIDATES) {
    if (candidate.startsWith('/')) {
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // continue checking candidates
      }
    } else {
      try {
        await execFileAsync('which', [candidate]);
        return candidate;
      } catch {
        // continue checking candidates
      }
    }
  }
  throw new Error('Could not locate Google Chrome or Chromium to render the PDF résumé.');
}

const resumeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Wave C. Ambray — Full-Stack &amp; Backend Software Engineer</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif;
      color: #1E293B;
      background: #FFFFFF;
      font-size: 9.7pt;
      line-height: 1.44;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .sheet {
      width: 210mm;
      height: 297mm;
      padding: 15.5mm 17.5mm 13mm 17.5mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      overflow: hidden;
    }

    .sheet:last-child {
      page-break-after: auto;
    }

    .sheet-body {
      flex: 1 1 auto;
    }

    .sheet-footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 8.2pt;
      color: #64748B;
    }

    h1 {
      font-size: 21.5pt;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #0F172A;
      line-height: 1.15;
      margin-bottom: 4px;
    }

    .headline {
      font-size: 10.6pt;
      font-weight: 700;
      color: #1D4ED8;
      line-height: 1.35;
      margin-bottom: 7px;
    }

    .contact-strip {
      font-size: 8.4pt;
      color: #475569;
      line-height: 1.48;
      margin-bottom: 13px;
    }

    .contact-strip a {
      color: #1D4ED8;
      text-decoration: none;
    }

    .contact-strip .sep {
      color: #94A3B8;
      margin: 0 5px;
    }

    .section-title {
      font-size: 9.6pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #0F172A;
      border-bottom: 1.25px solid #CBD5E1;
      padding-bottom: 3.5px;
      margin-top: 12px;
      margin-bottom: 8px;
    }

    .section-title.first-top {
      margin-top: 2px;
    }

    .summary-text {
      font-size: 9.5pt;
      line-height: 1.48;
      color: #1E293B;
      margin-bottom: 10px;
    }

    .skill-row {
      margin-bottom: 5.5px;
      font-size: 9.3pt;
      line-height: 1.42;
    }

    .skill-row strong.cat {
      color: #0F172A;
    }

    .role-block {
      margin-bottom: 11px;
    }

    .role-block:last-child {
      margin-bottom: 0;
    }

    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
    }

    .role-title {
      font-size: 10pt;
      font-weight: 700;
      color: #0F172A;
    }

    .role-period {
      font-size: 8.9pt;
      font-weight: 600;
      color: #334155;
      white-space: nowrap;
    }

    .company-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
      margin-top: 1px;
      margin-bottom: 5px;
    }

    .company-name {
      font-size: 9pt;
      font-weight: 700;
      color: #1D4ED8;
    }

    .company-loc {
      font-size: 8.4pt;
      color: #64748B;
      white-space: nowrap;
    }

    .promo-note {
      font-size: 8.8pt;
      font-style: italic;
      font-weight: 600;
      color: #334155;
      margin-bottom: 5px;
    }

    ul {
      padding-left: 16px;
    }

    li {
      margin-bottom: 5px;
      font-size: 9.35pt;
      line-height: 1.44;
    }

    li strong {
      color: #0F172A;
    }

    .edu-school {
      font-size: 9.4pt;
      color: #475569;
      margin-top: 2px;
    }

    .edu-note {
      font-size: 9.3pt;
      color: #1E293B;
      margin-top: 3px;
    }
  </style>
</head>
<body>

  <!-- PAGE 1 OF 3 -->
  <section class="sheet">
    <div class="sheet-body">
      <header>
        <h1>Wave C. Ambray</h1>
        <div class="headline">
          Full-Stack &amp; Backend Software Engineer — C#/.NET · TypeScript · Node.js · React &amp; Next.js
        </div>
        <div class="contact-strip">
          Cagayan de Oro City, Northern Mindanao, Philippines<span class="sep">|</span><span style="white-space: nowrap;">+63 965 429 7640 (WhatsApp / Viber)</span><span class="sep">|</span><a href="mailto:wacanam20@gmail.com">wacanam20@gmail.com</a><span class="sep">|</span><a href="https://linkedin.com/in/wave-ambray-a37736161">linkedin.com/in/wave-ambray-a37736161</a><span class="sep">|</span><a href="https://github.com/wacanam">github.com/wacanam</a>
        </div>
      </header>

      <h2 class="section-title first-top">Professional Summary</h2>
      <p class="summary-text">
        Full-Stack &amp; Backend Software Engineer with over 6 years of progressive experience designing, building, and scaling fast-loading, offline-first web and mobile applications and distributed backend platforms across US, Israeli, and enterprise engagements. Proven track record leading engineering and QA teams while delivering platforms handling 100M+ spatial data points, nationwide institutional data systems, and clinical EHR/ERP suites serving 20,000+ users with C#/.NET Minimal APIs, TypeScript/Node.js, React/Next.js, RabbitMQ, Redis, PostgreSQL, and RAG pipelines.
      </p>

      <h2 class="section-title">Technical Skills</h2>
      <div class="skill-row">
        <strong class="cat">Backend &amp; Data Access:</strong> C#, ASP.NET Core (Minimal APIs), EF Core, Dapper, TypeScript, JavaScript, Node.js, Express.js, Prisma, Drizzle ORM, SQL
      </div>
      <div class="skill-row">
        <strong class="cat">Frontend &amp; Mobile:</strong> React.js, Next.js, React Native (Expo), Multi-Paradigm State Management (Redux, Reactive, Atomic &amp; Server-State Libraries), Offline-First Sync, End-to-End Encryption (E2EE), Performance Optimization, HTML5, CSS3
      </div>
      <div class="skill-row">
        <strong class="cat">Architecture &amp; Messaging:</strong> Clean Architecture, Modular Monolith, Event-Driven Microservices, Distributed Systems, Multi-Tenant SaaS, RabbitMQ, Redis Cache, REST APIs, Webhooks, XML/JSON Serialization, RBAC Security
      </div>
      <div class="skill-row">
        <strong class="cat">AI &amp; Agentic Engineering:</strong> Retrieval-Augmented Generation (RAG), PostgreSQL pgvector, Vercel / Google / Microsoft AI SDKs, Claude Code, Antigravity, Codex, GitHub Copilot
      </div>
      <div class="skill-row">
        <strong class="cat">Testing &amp; Observability:</strong> xUnit, NUnit, End-to-End (E2E) Automated Testing, Dozzle (Container Log Monitoring), Hotjar (UX &amp; Session Telemetry)
      </div>
      <div class="skill-row">
        <strong class="cat">Databases, Storage &amp; DevOps:</strong> PostgreSQL (PostGIS, pgvector), MS SQL Server, Cloud Firestore, AWS S3, Azure Blob Storage, Local File System, Docker, Nginx Proxy Management, Kubernetes, GitHub Actions, AWS, Azure, GCP, Vercel, DigitalOcean, Keycloak, Clerk Auth
      </div>

      <h2 class="section-title">Professional Experience</h2>
      <div class="role-block">
        <div class="role-header">
          <div class="role-title">Senior Software Engineer (Full-Time)</div>
          <div class="role-period">03/2026 – Present</div>
        </div>
        <div class="company-row">
          <div class="company-name">Nextstep Software Corporation</div>
          <div class="company-loc">Cagayan de Oro City, Philippines · Hybrid</div>
        </div>
        <ul>
          <li>
            Served as Lead Developer and System Architect for flagship multi-tenant <strong>EHR/EMR (Clinic EZ)</strong> and <strong>ERP (ERP EZ)</strong> platforms across <strong>Modular Monolith and Microservices</strong> topologies using <strong>C#/.NET Minimal APIs, Node.js, RabbitMQ, and Redis</strong>, supporting <strong>20,000+ users and 100–300 daily active users (DAUs)</strong> across on-premise university and private clinic deployments on <strong>Next.js and React Native (Expo)</strong>.
          </li>
        </ul>
      </div>
    </div>
    <footer class="sheet-footer">
      <span>Wave C. Ambray — Résumé</span>
      <span>Page 1 of 3</span>
    </footer>
  </section>

  <!-- PAGE 2 OF 3 -->
  <section class="sheet">
    <div class="sheet-body">
      <div class="role-block">
        <ul>
          <li>
            Engineered tenant-isolated <strong>PostgreSQL</strong> persistence, <strong>end-to-end encryption (E2EE)</strong> for clinical and telemedicine payloads, offline-first client synchronization, strict <strong>XML/PDF schema serialization</strong>, and configurable state-machine workflows.
          </li>
          <li>
            Implemented <strong>Retrieval-Augmented Generation (RAG)</strong> capabilities backed by <strong>PostgreSQL pgvector</strong> similarity search and <strong>Vercel, Google, and Microsoft AI SDKs</strong>.
          </li>
          <li>
            Automated <strong>Docker, Nginx</strong> proxy management, <strong>GitHub Actions</strong>, and <strong>Vercel CI/CD</strong> pipelines with wildcard SSL/TLS routing, <strong>Dozzle</strong> container log monitoring, and <strong>Hotjar</strong> session telemetry—pairing Claude Code, Antigravity, Codex, and GitHub Copilot velocity with <strong>xUnit, NUnit, and automated E2E testing</strong>.
          </li>
          <li>
            Mentored a <strong>7-member engineering team</strong> (4 junior full-stack engineers, 1 QA, and 2 interns) to independent production delivery through Clean Architecture templates, strict PR quality gates, and client technical architecture reviews.
          </li>
        </ul>
      </div>

      <div class="role-block">
        <div class="role-header">
          <div class="role-title">Senior Technical Specialist (Contract)</div>
          <div class="role-period">01/2025 – 03/2026</div>
        </div>
        <div class="company-row">
          <div class="company-name">University of Science and Technology of Southern Philippines (USTP)</div>
          <div class="company-loc">Cagayan de Oro City, Philippines · Hybrid</div>
        </div>
        <ul>
          <li>
            Led full-stack architecture and delivery of the nationwide regulatory QoS and National Broadband Mapping platform using <strong>ASP.NET Core, EF Core, Dapper, PostGIS</strong> spatial indexing, and <strong>Redis</strong> caching across <strong>42,000+ spatial geometries and 100M+ growing spatial data points</strong>.
          </li>
          <li>
            Built asynchronous institutional ETL workers and schema validation pipelines with <strong>RabbitMQ</strong> and pluggable storage adapters (<strong>Local File Systems, AWS S3, and Azure Blob Storage</strong>) serving nationwide <strong>State Universities and Colleges (SUCs)</strong> and <strong>Higher Education Institutions (HEIs)</strong>.
          </li>
          <li>
            Hardened hybrid infrastructure with <strong>Keycloak RBAC, Nginx</strong> proxy management, and <strong>Dozzle</strong> container logging while leading a <strong>6-member team</strong> (4 junior engineers and 2 QA specialists)—enforcing <strong>xUnit/NUnit</strong> and E2E release gates, architectural code reviews, and stakeholder sign-offs.
          </li>
        </ul>
      </div>

      <div class="role-block">
        <div class="role-header">
          <div class="role-title">Full Stack Engineer (Full-Time)</div>
          <div class="role-period">04/2024 – 12/2024</div>
        </div>
        <div class="company-row">
          <div class="company-name">PointersBit Inc.</div>
          <div class="company-loc">Cagayan de Oro City, Philippines · Hybrid</div>
        </div>
        <ul>
          <li>
            Architected full-stack web features and front-end engineering standards across client platforms, enforcing strict PR review gates, modular component design, and agentic AI-assisted development guardrails.
          </li>
          <li>
            Delivered low-latency, responsive <strong>React and TypeScript</strong> applications utilizing scalable client and server-state management patterns and bundle/rendering optimizations.
          </li>
        </ul>
      </div>

      <div class="role-block">
        <div class="role-header">
          <div class="role-title">Full Stack Engineer (Full-Time)</div>
          <div class="role-period">02/2023 – 04/2024</div>
        </div>
        <div class="company-row">
          <div class="company-name">Spearhead Software</div>
          <div class="company-loc">New York, USA · Remote</div>
        </div>
        <ul>
          <li>
            Engineered distributed backend services and RESTful APIs using <strong>Clean Architecture, C#/.NET, and Node.js</strong>, integrating Prisma and Drizzle ORM alongside AWS S3 and Azure Blob object storage for US client platforms.
          </li>
          <li>
            Built fast-loading <strong>React and TypeScript</strong> interfaces leveraging modern state management libraries beyond Redux, offline-resilient client caching, and encrypted client-server payloads.
          </li>
        </ul>
      </div>
    </div>
    <footer class="sheet-footer">
      <span>Wave C. Ambray — Résumé</span>
      <span>Page 2 of 3</span>
    </footer>
  </section>

  <!-- PAGE 3 OF 3 -->
  <section class="sheet">
    <div class="sheet-body">
      <div class="role-block">
        <div class="role-header">
          <div class="role-title">Software Engineer (Full-Time)</div>
          <div class="role-period">06/2022 – 02/2023</div>
        </div>
        <div class="company-row">
          <div class="company-name">BenManage</div>
          <div class="company-loc">Israel · Remote</div>
        </div>
        <ul>
          <li>
            Developed and maintained a live production enterprise benefits administration platform within an agile Israeli engineering team, shipping new modules with strict <strong>backward compatibility</strong> across active client deployments.
          </li>
          <li>
            Engineered non-breaking backend API integrations and additive relational <strong>SQL schema evolutions</strong> to safeguard legacy workflows and production uptime.
          </li>
        </ul>
      </div>

      <div class="role-block">
        <div class="role-header">
          <div class="role-title">Computer Programmer 2 &amp; Computer Researcher 2 (Contract)</div>
          <div class="role-period">02/2020 – 07/2022</div>
        </div>
        <div class="company-row">
          <div class="company-name">University of Science and Technology of Southern Philippines (USTP)</div>
          <div class="company-loc">Cagayan de Oro City, Philippines · On-Site &amp; Hybrid</div>
        </div>
        <div class="promo-note">Promoted from Computer Researcher 2 (02/2020 – 07/2021) to Computer Programmer 2 (08/2021 – 07/2022)</div>
        <ul>
          <li>
            Developed and maintained campus-wide academic and administrative web and mobile applications, relational database workflows, and internal research/automation systems using <strong>C#, React.js, React Native, and SQL</strong>.
          </li>
        </ul>
      </div>

      <h2 class="section-title">Educational Background &amp; Community</h2>
      <div class="role-block">
        <div class="role-header">
          <div class="role-title">Bachelor of Science in Electronics and Communications Engineering</div>
          <div class="role-period">2015 – 2020</div>
        </div>
        <div class="edu-school">University of Science and Technology of Southern Philippines (USTP)</div>
        <div class="edu-note">Active Contributor, Northern Mindanao ICT Startup Ecosystem</div>
      </div>
    </div>
    <footer class="sheet-footer">
      <span>Wave C. Ambray — Résumé</span>
      <span>Page 3 of 3</span>
    </footer>
  </section>

</body>
</html>
`;

async function main() {
  const chromeBin = await resolveChromeBinary();
  const tmpHtml = path.join(os.tmpdir(), `wave-resume-${Date.now()}.html`);

  try {
    await fs.writeFile(tmpHtml, resumeHtml, 'utf-8');
    await fs.mkdir(path.dirname(outPdfPath), { recursive: true });

    await execFileAsync(chromeBin, [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${outPdfPath}`,
      pathToFileURL(tmpHtml).href,
    ]);

    const pdfBuf = await fs.readFile(outPdfPath);
    const pages = (pdfBuf.toString('latin1').match(/\/MediaBox\s*\[/g) || []).length;
    console.log(`[build-resume] Rendered ${outPdfPath} (${pdfBuf.length} bytes, ${pages} A4 pages)`);
    if (pages !== 3) {
      throw new Error(`Expected exact 3-page PDF, rendered ${pages} pages.`);
    }
  } finally {
    await fs.rm(tmpHtml, { force: true });
  }
}

main().catch((err) => {
  console.error('[build-resume] Failed:', err);
  process.exit(1);
});

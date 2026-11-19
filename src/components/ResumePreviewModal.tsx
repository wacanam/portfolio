import React, { useEffect, useRef, useState } from 'react';
import { X, Download, ExternalLink, FileText, Eye } from 'lucide-react';
import { contactData } from '../data/portfolio';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PreviewMode = 'spec' | 'pdf';

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [mode, setMode] = useState<PreviewMode>('spec');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setTimeout(() => closeBtnRef.current?.focus(), 40);
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Modern Web Guidance light-dismiss via backdrop bounding check
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInDialog) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      {...({ closedby: 'any' } as Record<string, unknown>)}
      aria-labelledby="resume-preview-title"
      className="my-auto mx-auto w-[94vw] max-w-[920px] rounded-[24px] p-0 glass-sheet focus:outline-none overflow-hidden text-[var(--text-primary)]"
    >
      <div className="flex flex-col max-h-[88vh] overflow-hidden">
        {/* Top Modal Header */}
        <header className="px-5 sm:px-6 py-4 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-hairline)] text-[var(--accent-titanium)] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="resume-preview-title"
                className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)] truncate"
              >
                {contactData.name} · Technical Résumé
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-tertiary)] truncate">
                Verified 2-Page A4 Curriculum Vitae
              </p>
            </div>
          </div>

          {/* Mode Toggle + Quick File Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center p-0.5 rounded-full bg-[var(--surface-card)] border border-[var(--border-hairline)]"
              role="tablist"
              aria-label="Résumé preview mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'spec'}
                onClick={() => setMode('spec')}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors ${
                  mode === 'spec'
                    ? 'bg-[var(--accent-titanium)] text-[var(--bg-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Interactive 2-Page
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'pdf'}
                onClick={() => setMode('pdf')}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors ${
                  mode === 'pdf'
                    ? 'bg-[var(--accent-titanium)] text-[var(--bg-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Original PDF
              </button>
            </div>

            <a
              href={contactData.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dock text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-[var(--accent-titanium)]" />
              <span className="hidden sm:inline">Open Tab</span>
            </a>

            <a
              href={contactData.resumeUrl}
              download="Wave_Ambray_Resume.pdf"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-[11px] font-mono font-semibold hover:opacity-90 transition-opacity"
            >
              <Download className="w-3 h-3" />
              <span>Download PDF</span>
            </a>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close résumé preview"
              className="p-1.5 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-6">
          {mode === 'pdf' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[var(--accent-titanium)]" />
                  <span>Embedded PDF Preview (mobile browsers may use Open Tab or Interactive mode)</span>
                </span>
              </div>
              <iframe
                src={`${contactData.resumeUrl}#view=FitH`}
                title="Wave Cantery Ambray Verified Résumé PDF"
                className="w-full h-[64vh] rounded-2xl border border-[var(--border-subtle)] bg-white"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* PAGE 1 SPEC SHEET */}
              <article className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-card)]/40 p-5 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-4 border-b border-[var(--border-hairline)]">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                      Wave Cantery Ambray
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[var(--accent-titanium)] mt-0.5">
                      Full-Stack &amp; Backend Software Engineer — C#/.NET · TypeScript · Node.js · React &amp; Next.js
                    </p>
                    <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Cagayan de Oro City, Northern Mindanao, PH · +63 965 429 7640 (WhatsApp / Viber) · {contactData.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] shrink-0">
                    Page 1 of 2
                  </span>
                </div>

                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--accent-titanium)] mb-2 pb-1 border-b border-[var(--border-hairline)]">
                    Professional Summary
                  </h4>
                  <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Full-Stack &amp; Backend Software Engineer with over 6 years of progressive experience designing, building, and scaling fast-loading, offline-first web and mobile applications and distributed backend platforms across US, Israeli, and enterprise engagements. Proven track record leading engineering and QA teams while delivering platforms handling 100M+ spatial data points, nationwide institutional data systems, and clinical EHR/ERP suites serving 20,000+ users with C#/.NET Minimal APIs, TypeScript/Node.js, React/Next.js, RabbitMQ, Redis, PostgreSQL, and RAG pipelines.
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--accent-titanium)] mb-2.5 pb-1 border-b border-[var(--border-hairline)]">
                    Technical Skills
                  </h4>
                  <dl className="space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <div>
                      <dt className="inline font-semibold text-[var(--text-primary)]">Backend &amp; Data Access: </dt>
                      <dd className="inline">C#, ASP.NET Core (Minimal APIs), EF Core, Dapper, TypeScript, JavaScript, Node.js, Express.js, Prisma, Drizzle ORM, SQL</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-[var(--text-primary)]">Frontend &amp; Mobile: </dt>
                      <dd className="inline">React.js, Next.js, React Native (Expo), Multi-Paradigm State Management (Redux, Reactive, Atomic &amp; Server-State Libraries), Offline-First Sync, End-to-End Encryption (E2EE), Performance Optimization, HTML5, CSS3</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-[var(--text-primary)]">Architecture &amp; Messaging: </dt>
                      <dd className="inline">Clean Architecture, Modular Monolith, Event-Driven Microservices, Distributed Systems, Multi-Tenant SaaS, RabbitMQ, Redis Cache, REST APIs, Webhooks, XML/JSON Serialization, RBAC Security</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-[var(--text-primary)]">AI &amp; Agentic Engineering: </dt>
                      <dd className="inline">Retrieval-Augmented Generation (RAG), PostgreSQL pgvector, Vercel / Google / Microsoft AI SDKs, Claude Code, Antigravity, Codex, GitHub Copilot</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-[var(--text-primary)]">Testing &amp; Observability: </dt>
                      <dd className="inline">xUnit, NUnit, End-to-End (E2E) Automated Testing, Dozzle (Container Log Monitoring), Hotjar (UX &amp; Session Telemetry)</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-[var(--text-primary)]">Databases, Storage &amp; DevOps: </dt>
                      <dd className="inline">PostgreSQL (PostGIS, pgvector), MS SQL Server, Cloud Firestore, AWS S3, Azure Blob Storage, Local File System, Docker, Nginx Proxy Management, Kubernetes, GitHub Actions, AWS, Azure, GCP, Vercel, DigitalOcean, Keycloak, Clerk Auth</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--accent-titanium)] mb-2.5 pb-1 border-b border-[var(--border-hairline)]">
                    Professional Experience
                  </h4>
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">Senior Software Engineer (Full-Time)</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">03/2026 – Present</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs mb-2">
                      <span className="font-semibold text-[var(--accent-titanium)]">Nextstep Software Corporation</span>
                      <span className="text-[var(--text-tertiary)]">Cagayan de Oro City, Philippines · Hybrid</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <li>Served as Lead Developer and System Architect for flagship multi-tenant <strong className="text-[var(--text-primary)]">EHR/EMR (Clinic EZ)</strong> and <strong className="text-[var(--text-primary)]">ERP (ERP EZ)</strong> platforms across Modular Monolith and Microservices topologies using C#/.NET Minimal APIs, Node.js, RabbitMQ, and Redis, supporting <strong className="text-[var(--text-primary)]">20,000+ users and 100–300 daily active users (DAUs)</strong> across on-premise university and private clinic deployments on Next.js and React Native (Expo).</li>
                      <li>Engineered tenant-isolated PostgreSQL persistence, end-to-end encryption (E2EE) for clinical and telemedicine payloads, offline-first client synchronization, strict XML/PDF schema serialization, and configurable state-machine workflows.</li>
                      <li>Implemented Retrieval-Augmented Generation (RAG) capabilities backed by PostgreSQL pgvector similarity search and Vercel, Google, and Microsoft AI SDKs.</li>
                      <li>Automated Docker, Nginx proxy management, GitHub Actions, and Vercel CI/CD pipelines with wildcard SSL/TLS routing, Dozzle container log monitoring, and Hotjar session telemetry—pairing agentic engineering tools with xUnit, NUnit, and automated E2E testing.</li>
                      <li>Mentored a <strong className="text-[var(--text-primary)]">7-member engineering team</strong> (4 junior full-stack engineers, 1 QA, and 2 interns) to independent production delivery through Clean Architecture templates, strict PR quality gates, and client technical architecture reviews.</li>
                    </ul>
                  </div>
                </div>
              </article>

              {/* PAGE 2 SPEC SHEET */}
              <article className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-card)]/40 p-5 sm:p-8 space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--accent-titanium)]">
                    Professional Experience (Continued)
                  </h4>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
                    Page 2 of 2
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">Senior Technical Specialist (Contract)</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">01/2025 – 03/2026</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs mb-1.5">
                      <span className="font-semibold text-[var(--accent-titanium)]">University of Science and Technology of Southern Philippines (USTP)</span>
                      <span className="text-[var(--text-tertiary)]">Cagayan de Oro City, Philippines · Hybrid</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <li>Led full-stack architecture and delivery of the nationwide regulatory QoS and National Broadband Mapping platform using ASP.NET Core, EF Core, Dapper, PostGIS spatial indexing, and Redis caching across <strong className="text-[var(--text-primary)]">42,000+ spatial geometries and 100M+ growing spatial data points</strong>.</li>
                      <li>Built asynchronous institutional ETL workers and schema validation pipelines with RabbitMQ and pluggable storage adapters (Local File Systems, AWS S3, and Azure Blob Storage) serving nationwide State Universities and Colleges (SUCs) and Higher Education Institutions (HEIs).</li>
                      <li>Hardened hybrid infrastructure with Keycloak RBAC, Nginx proxy management, and Dozzle container logging while leading a 6-member team (4 junior engineers and 2 QA specialists)—enforcing xUnit/NUnit and E2E release gates, architectural code reviews, and stakeholder sign-offs.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">Full Stack Engineer (Full-Time)</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">04/2024 – 12/2024</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs mb-1.5">
                      <span className="font-semibold text-[var(--accent-titanium)]">PointersBit Inc.</span>
                      <span className="text-[var(--text-tertiary)]">Cagayan de Oro City, Philippines · Hybrid</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <li>Architected full-stack web features and front-end engineering standards across client platforms, enforcing strict PR review gates, modular component design, and agentic AI-assisted development guardrails.</li>
                      <li>Delivered low-latency, responsive React and TypeScript applications utilizing scalable client and server-state management patterns and bundle/rendering optimizations.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">Full Stack Engineer (Full-Time)</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">02/2023 – 04/2024</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs mb-1.5">
                      <span className="font-semibold text-[var(--accent-titanium)]">Spearhead Software</span>
                      <span className="text-[var(--text-tertiary)]">New York, USA · Remote</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <li>Engineered distributed backend services and RESTful APIs using Clean Architecture, C#/.NET, and Node.js, integrating Prisma and Drizzle ORM alongside AWS S3 and Azure Blob object storage for US client platforms.</li>
                      <li>Built fast-loading React and TypeScript interfaces leveraging modern state management libraries beyond Redux, offline-resilient client caching, and encrypted client-server payloads.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">Software Engineer (Full-Time)</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">06/2022 – 02/2023</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs mb-1.5">
                      <span className="font-semibold text-[var(--accent-titanium)]">BenManage</span>
                      <span className="text-[var(--text-tertiary)]">Israel · Remote</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <li>Developed and maintained a live production enterprise benefits administration platform within an agile Israeli engineering team, shipping new modules with strict backward compatibility across active client deployments.</li>
                      <li>Engineered non-breaking backend API integrations and additive relational SQL schema evolutions to safeguard legacy workflows and production uptime.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">Computer Programmer 2 &amp; Computer Researcher 2 (Contract)</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">02/2020 – 07/2022</span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs mb-1">
                      <span className="font-semibold text-[var(--accent-titanium)]">University of Science and Technology of Southern Philippines (USTP)</span>
                      <span className="text-[var(--text-tertiary)]">Cagayan de Oro City, Philippines · On-Site &amp; Hybrid</span>
                    </div>
                    <p className="text-[11px] italic text-[var(--text-secondary)] mb-1">
                      Promoted from Computer Researcher 2 (02/2020 – 07/2021) to Computer Programmer 2 (08/2021 – 07/2022)
                    </p>
                    <ul className="list-disc pl-4 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <li>Developed and maintained campus-wide academic and administrative web and mobile applications, relational database workflows, and internal research/automation systems using C#, React.js, React Native, and SQL.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--accent-titanium)] mb-2 pb-1 border-b border-[var(--border-hairline)]">
                    Educational Background &amp; Community
                  </h4>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]">Bachelor of Science in Electronics and Communications Engineering</span>
                    <span className="text-xs font-mono text-[var(--text-secondary)]">2015 – 2020</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    University of Science and Technology of Southern Philippines (USTP) · Active Contributor, Northern Mindanao ICT Startup Ecosystem
                  </p>
                </div>
              </article>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

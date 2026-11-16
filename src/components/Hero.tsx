import React from 'react';
import { Download, ArrowRight, Github, Linkedin, Mail, MessageSquare } from 'lucide-react';
import { contactData } from '../data/portfolio';

interface HeroProps {
  activeFormation: number;
  onSelectFormation: (idx: 0 | 1 | 2 | 3) => void;
}

const formationNames = [
  { id: 0, label: 'Sphere', desc: 'Fibonacci Orbital' },
  { id: 1, label: 'Wave', desc: 'Topographic Wave' },
  { id: 2, label: 'Torus', desc: 'Dual-Ring Cipher' },
  { id: 3, label: 'Lattice', desc: 'State Machine' },
] as const;

export const Hero: React.FC<HeroProps> = ({ activeFormation, onSelectFormation }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center select-none"
    >
      {/* Editorial Scrim Container protecting typography legibility over 3D particle canvas */}
      <div className="reading-scrim relative max-w-3xl w-full mx-auto py-8 px-3 sm:px-6 rounded-3xl flex flex-col items-center">
        {/* Top Availability Kicker (no SaaS pill badge) */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 mb-7 text-xs font-medium tracking-[0.02em] text-[var(--text-secondary)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-signal)]" aria-hidden="true" />
          <span>Available for Mid-to-Senior Roles</span>
          <span className="text-[var(--border-subtle)]" aria-hidden="true">/</span>
          <span className="text-[var(--text-primary)]">Remote Worldwide</span>
        </div>

        {/* Sculptural Headline */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[1.04] mb-5 text-metallic max-w-4xl">
          Wave C. Ambray
        </h1>

        {/* Radical Word Economy Statement (11 words <= 16 words) */}
        <p className="text-lg sm:text-xl md:text-2xl font-normal text-[var(--text-secondary)] tracking-tight max-w-2xl mx-auto mb-10 leading-relaxed">
          {'Full-Stack Engineer. Distributed .NET & TypeScript systems built for national scale.'}
        </p>

        {/* Open Hairline Architectural Specification Strip */}
        <dl className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6 py-6 mb-10 border-y border-[var(--border-subtle)] text-left">
          <div className="sm:pr-4">
            <dt className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Engineering
            </dt>
            <dd className="mt-1 font-mono-numbers text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              6+ Yrs
            </dd>
          </div>
          <div className="sm:border-l sm:border-[var(--border-hairline)] sm:pl-5">
            <dt className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Spatial Points
            </dt>
            <dd className="mt-1 font-mono-numbers text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              100M+
            </dd>
          </div>
          <div className="sm:border-l sm:border-[var(--border-hairline)] sm:pl-5">
            <dt className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Active Users
            </dt>
            <dd className="mt-1 font-mono-numbers text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              20K+
            </dd>
          </div>
          <div className="sm:border-l sm:border-[var(--border-hairline)] sm:pl-5">
            <dt className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
              Remote Pedigree
            </dt>
            <dd className="mt-1 font-mono-numbers text-xl sm:text-2xl font-semibold text-[var(--accent-titanium)]">
              US &amp; IL
            </dd>
          </div>
        </dl>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <button
            onClick={() => scrollTo('systems')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium text-sm tracking-wide transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
          >
            <span>Explore Systems</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={contactData.resumeUrl}
            download="Wave_Ambray_Resume.pdf"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full glass-dock text-[var(--text-primary)] font-medium text-sm tracking-wide transition-all hover:bg-[var(--border-subtle)] active:scale-[0.98] border border-[var(--border-subtle)]"
          >
            <Download className="w-4 h-4 text-[var(--accent-titanium)]" />
            <span>Download Résumé</span>
          </a>
        </div>

        {/* Quiet Social Links */}
        <div className="flex items-center gap-5 text-[var(--text-secondary)] mb-12">
          <a
            href={contactData.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="p-2 rounded-full hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)] transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href={contactData.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="p-2 rounded-full hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)] transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={`mailto:${contactData.email}`}
            aria-label="Direct Email"
            className="p-2 rounded-full hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)] transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            href={contactData.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Direct WhatsApp"
            className="p-2 rounded-full hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>

        {/* Discreet Hairline 3D Formation Index Tabs */}
        <div
          className="inline-flex items-center gap-4 sm:gap-5 border-b border-[var(--border-hairline)] px-1"
          role="group"
          aria-label="Particle geometry preview"
        >
          {formationNames.map((f, i) => {
            const isActive = activeFormation === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFormation(f.id)}
                title={f.desc}
                className={`pb-2 -mb-px text-xs font-mono tracking-wide border-b-2 transition-colors ${
                  isActive
                    ? 'border-[var(--accent-titanium)] text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <span className="opacity-50 mr-1.5">0{i + 1}</span>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

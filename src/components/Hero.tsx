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
      {/* Top Status Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-dock mb-8 border border-[var(--border-hairline)] shadow-sm animate-fade-in">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-signal)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-signal)]"></span>
        </span>
        <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--accent-signal)] font-semibold">
          Available for Mid-to-Senior Roles · Remote Worldwide
        </span>
      </div>

      {/* Sculptural Headline */}
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[-0.04em] leading-[1.05] mb-5 text-metallic max-w-4xl">
        Wave C. Ambray
      </h1>

      {/* Radical Word Economy Statement (12 words <= 16 words) */}
      <p className="text-lg sm:text-xl md:text-2xl font-normal text-[var(--text-secondary)] tracking-tight max-w-2xl mx-auto mb-10 leading-relaxed">
        Senior Full-Stack Engineer. Distributed .NET &amp; TypeScript systems built for national scale.
      </p>

      {/* Monospace Proof Strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2 px-4 rounded-xl glass-dock border border-[var(--border-hairline)] mb-10 max-w-2xl font-mono-numbers text-xs sm:text-sm text-[var(--text-secondary)]">
        <div>
          <span className="text-[var(--text-primary)] font-semibold">6+ YRS</span>{' '}
          <span className="opacity-75">Engineering</span>
        </div>
        <span className="text-[var(--border-subtle)] select-none">·</span>
        <div>
          <span className="text-[var(--text-primary)] font-semibold">100M+</span>{' '}
          <span className="opacity-75">Spatial Points</span>
        </div>
        <span className="text-[var(--border-subtle)] select-none">·</span>
        <div>
          <span className="text-[var(--text-primary)] font-semibold">20K+</span>{' '}
          <span className="opacity-75">Active Users</span>
        </div>
        <span className="text-[var(--border-subtle)] select-none">·</span>
        <div>
          <span className="text-[var(--accent-titanium)] font-semibold">US &amp; IL</span>{' '}
          <span className="opacity-75">Remote Pedigree</span>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
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
      <div className="flex items-center gap-5 text-[var(--text-secondary)] mb-14">
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

      {/* Floating 3D Formation Switcher Pill */}
      <div className="glass-dock rounded-full px-2 py-1.5 flex items-center gap-1 border border-[var(--border-hairline)] shadow-md">
        <span className="text-[10px] font-mono tracking-wider text-[var(--text-secondary)] px-2.5 hidden sm:inline">
          3D MORPH:
        </span>
        {formationNames.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelectFormation(f.id)}
            className={`px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
              activeFormation === f.id
                ? 'bg-[var(--accent-titanium)] text-[var(--bg-primary)] font-semibold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-hairline)]'
            }`}
            title={f.desc}
          >
            {f.label}
          </button>
        ))}
      </div>
    </section>
  );
};

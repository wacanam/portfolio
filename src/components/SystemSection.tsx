import React from 'react';
import { Plus } from 'lucide-react';
import { flagshipSystems } from '../data/portfolio';
import { FlagshipSystem } from '../types';
import { skillsMatch, systemMatchesSkill } from '../utils/skillMatch';

interface SystemSectionProps {
  onOpenArchitectureSheet: (system: FlagshipSystem) => void;
  selectedSkill?: string | null;
  onSelectSkill?: (skill: string | null) => void;
}

// 4 curated real architectural stack tokens per system matching verified résumé experience
const systemTokens: Record<string, string[]> = {
  'system-broadband': ['ASP.NET Core', 'EF Core & Dapper', 'PostGIS', 'Redis'],
  'system-clinic-erp': ['.NET Minimal APIs', 'Next.js & Expo', 'pgvector RAG', 'RabbitMQ'],
  'system-edcs': ['ASP.NET Core', 'RabbitMQ ETL', 'Local / S3 / Azure', 'Keycloak RBAC'],
};

export const SystemSection: React.FC<SystemSectionProps> = ({
  onOpenArchitectureSheet,
  selectedSkill = null,
  onSelectSkill,
}) => {
  return (
    <section id="systems" className="relative py-28 px-6 max-w-6xl mx-auto select-none">
      <div className="space-y-40">
        {flagshipSystems.map((system) => {
          const tokens = systemTokens[system.id] || system.deepArchitecture.techStack.slice(0, 4);
          const isMatchedSystem = systemMatchesSkill(system, tokens, selectedSkill);

          return (
            <article
              key={system.id}
              className="scroll-mt-28 flex flex-col items-start gap-7"
              aria-labelledby={`heading-${system.id}`}
            >
              {/* 1. Editorial Hairline Kicker */}
              <div className="inline-flex flex-wrap items-center gap-3">
                <span className="w-6 h-px bg-[var(--accent-titanium)]" aria-hidden="true" />
                <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--accent-titanium)] font-semibold">
                  {system.chapter}
                </span>
                <span className="text-xs text-[var(--border-subtle)]">·</span>
                <span className="text-[11px] font-mono tracking-wider text-[var(--text-secondary)] uppercase">
                  Flagship Architecture
                </span>
                {isMatchedSystem && selectedSkill && (
                  <>
                    <span className="text-xs text-[var(--border-subtle)]">·</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--accent-signal)] font-semibold">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-signal)]" aria-hidden="true" />
                      Matches · {selectedSkill}
                    </span>
                  </>
                )}
              </div>

              {/* 2. Oversized Tabular Metric */}
              <div className="font-mono-numbers text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-metallic">
                {system.scaleProof}
              </div>

              {/* 3. Crisp Title (retains heading-${system.id} for scroll IntersectionObserver) */}
              <h2
                id={`heading-${system.id}`}
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] max-w-3xl"
              >
                {system.title}
              </h2>

              {/* 4. Executive Summary (verified <= 16 words) */}
              <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                {system.subtitle}
              </p>

              {/* 5. Clean Interactive Typographic Monospace Stack Spec Line (zero pill chip clutter) */}
              <div className="flex flex-wrap items-center text-xs font-mono tracking-wide text-[var(--text-secondary)]">
                {tokens.map((token, idx) => {
                  const isTokenMatch = selectedSkill ? skillsMatch(token, selectedSkill) : false;
                  return (
                    <React.Fragment key={token}>
                      {idx > 0 && (
                        <span className="mx-2.5 text-[var(--border-subtle)]" aria-hidden="true">
                          ·
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onSelectSkill?.(isTokenMatch ? null : token)
                        }
                        title={isTokenMatch ? `Clear ${token} filter` : `Filter portfolio by ${token}`}
                        className={`transition-colors cursor-pointer rounded focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--accent-titanium)] ${
                          isTokenMatch
                            ? 'text-[var(--accent-titanium)] font-semibold underline decoration-[var(--accent-titanium)] underline-offset-4'
                            : 'hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {token}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* 6. Closer Look + Action Navigation Button (opens full-page architecture view) */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenArchitectureSheet(system)}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full glass-dock text-xs font-semibold tracking-wide text-[var(--text-primary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] transition-all active:scale-[0.98] shadow-sm"
                >
                  <span>Closer look</span>
                  <Plus className="w-3.5 h-3.5 text-[var(--accent-titanium)]" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

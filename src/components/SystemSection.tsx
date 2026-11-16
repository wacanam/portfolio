import React from 'react';
import { Plus } from 'lucide-react';
import { flagshipSystems } from '../data/portfolio';
import { FlagshipSystem } from '../types';

interface SystemSectionProps {
  onOpenArchitectureSheet: (system: FlagshipSystem) => void;
}

// 4 curated minimal architectural stack tokens per system
const systemTokens: Record<string, string[]> = {
  'system-broadband': ['C# / .NET 8', 'PostGIS', 'Redis Cluster', 'MapLibre GL'],
  'system-clinic-erp': ['.NET Core', 'Next.js & Expo', 'pgvector RAG', 'RabbitMQ'],
  'system-edcs': ['ASP.NET Core', 'RabbitMQ', 'Keycloak OIDC', 'JSON Schema'],
};

export const SystemSection: React.FC<SystemSectionProps> = ({ onOpenArchitectureSheet }) => {
  return (
    <section id="systems" className="relative py-28 px-6 max-w-6xl mx-auto select-none">
      <div className="space-y-40">
        {flagshipSystems.map((system) => {
          const tokens = systemTokens[system.id] || system.deepArchitecture.techStack.slice(0, 4);

          return (
            <article
              key={system.id}
              className="scroll-mt-28 flex flex-col items-start gap-8"
              aria-labelledby={`heading-${system.id}`}
            >
              {/* 1. Chapter Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dock border border-[var(--border-hairline)]">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--accent-titanium)] font-semibold">
                  {system.chapter}
                </span>
                <span className="text-xs text-[var(--border-subtle)]">·</span>
                <span className="text-[10px] font-mono tracking-wider text-[var(--text-secondary)] uppercase">
                  Flagship Architecture
                </span>
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

              {/* 5. 4 Minimal Stack Tokens */}
              <div className="flex flex-wrap items-center gap-2">
                {tokens.map((token) => (
                  <span
                    key={token}
                    className="px-3.5 py-1.5 rounded-full text-xs font-mono glass-dock text-[var(--text-secondary)] border border-[var(--border-hairline)]"
                  >
                    {token}
                  </span>
                ))}
              </div>

              {/* 6. Closer Look + Frosted Pill Button (NO inline bento, NO inline pipeline) */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenArchitectureSheet(system)}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full glass-dock text-xs font-semibold tracking-wide text-[var(--text-primary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] transition-all active:scale-[0.98] shadow-sm"
                  aria-haspopup="dialog"
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

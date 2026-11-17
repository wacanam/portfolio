import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Shield, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import { flagshipSystems } from '../data/portfolio';
import { FlagshipSystem } from '../types';

interface ArchitectureSheetProps {
  system: FlagshipSystem | null;
  onSelectSystem?: (system: FlagshipSystem) => void;
  onClose: () => void;
}

export const ArchitectureSheet: React.FC<ArchitectureSheetProps> = ({
  system,
  onSelectSystem,
  onClose,
}) => {
  const [activeNodeIdx, setActiveNodeIdx] = useState(0);

  // Reset pipeline selection and scroll cleanly to top when switching systems
  useEffect(() => {
    if (!system) return;
    setActiveNodeIdx(0);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [system?.id]);

  // Allow Escape key to return to portfolio overview cleanly
  useEffect(() => {
    if (!system) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [system, onClose]);

  if (!system) {
    return null;
  }

  const activeNode = system.nodes[activeNodeIdx] ?? system.nodes[0];
  const currentIdx = flagshipSystems.findIndex((s) => s.id === system.id);
  const nextSystem = flagshipSystems[(currentIdx + 1) % flagshipSystems.length];

  return (
    <div className="relative z-10 min-h-screen w-full pb-28 select-none">
      {/* Sticky Minimal Top Navigation Bar */}
      <header className="sticky top-0 z-30 glass-dock border-b border-[var(--border-hairline)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wide text-[var(--text-primary)] hover:text-[var(--accent-titanium)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>

          <div className="flex items-center gap-2">
            {onSelectSystem && (
              <nav className="hidden sm:flex items-center gap-1" aria-label="Architecture case studies">
                {flagshipSystems.map((item, idx) => {
                  const isCurrent = item.id === system.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSystem(item)}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono transition-colors ${
                        isCurrent
                          ? 'bg-[var(--surface-card-strong)] text-[var(--accent-titanium)] border border-[var(--border-subtle)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      0{idx + 1} · {item.title.split(' ')[0]}
                    </button>
                  );
                })}
              </nav>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-card)] rounded border border-[var(--border-hairline)]">
              ESC
            </kbd>
          </div>
        </div>
      </header>

      {/* Main Dedicated Full-Page Case Study */}
      <article className="max-w-5xl mx-auto px-6 pt-12 sm:pt-16">
        {/* Editorial Kicker */}
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[var(--accent-titanium)]" aria-hidden="true" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--accent-titanium)] font-semibold">
            {system.chapter} · ARCHITECTURE SPECIFICATION
          </span>
          <span className="text-xs text-[var(--border-subtle)]">·</span>
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">
            {system.scaleProof}
          </span>
        </div>

        {/* Display Headline & Executive Summary */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-metallic leading-[1.08] mb-5 max-w-4xl">
          {system.title}
        </h1>
        <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-3xl leading-relaxed mb-12">
          {system.subtitle}
        </p>

        {/* Open Hairline 4-Column Spec Strip (matches Hero rhythm) */}
        <dl className="w-full grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6 py-6 mb-14 border-y border-[var(--border-subtle)] text-left">
          {system.metrics.map((m, idx) => (
            <div
              key={m.label}
              className={idx > 0 ? 'sm:border-l sm:border-[var(--border-hairline)] sm:pl-5' : 'sm:pr-4'}
            >
              <dt className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                {m.label}
              </dt>
              <dd className="mt-1 font-mono-numbers text-lg sm:text-2xl font-semibold text-[var(--text-primary)]">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* 5-Node Interactive Architecture Pipeline */}
        <section
          className="py-4 mb-14"
          aria-label="5-Node Distributed Architecture Pipeline"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-[var(--border-hairline)]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] font-semibold">
              <Layers className="w-4 h-4" />
              <span>5-Node System Flow</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              Select a stage to inspect responsibilities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mb-8">
            {system.nodes.map((node, idx) => {
              const isSelected = activeNodeIdx === idx;
              return (
                <button
                  key={node.id}
                  onClick={() => setActiveNodeIdx(idx)}
                  className={`text-left p-3.5 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-[var(--accent-titanium)] text-[var(--bg-primary)] font-semibold border-[var(--accent-titanium)] shadow-sm'
                      : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] border-[var(--border-hairline)] hover:border-[var(--border-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold tracking-wider">
                      0{idx + 1}
                    </span>
                    {idx < 4 && (
                      <ArrowRight
                        className={`w-3 h-3 hidden sm:block ${
                          isSelected ? 'opacity-80' : 'text-[var(--text-tertiary)] opacity-60'
                        }`}
                      />
                    )}
                  </div>
                  <div className="text-xs font-medium leading-snug">
                    {node.name.replace(/^Node \d+:\s*/, '')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Node Inspector */}
          {activeNode && (
            <div className="border-l-2 border-[var(--accent-titanium)] pl-5 sm:pl-6 py-2 text-sm text-[var(--text-secondary)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--border-hairline)]">
                <div className="font-semibold text-[var(--text-primary)]">
                  {activeNode.name} ·{' '}
                  <span className="text-[var(--accent-titanium)]">{activeNode.tech}</span>
                </div>
                <div className="text-[var(--text-secondary)] font-mono text-xs">
                  <span className="text-[var(--text-tertiary)] uppercase mr-1.5">Focus:</span>
                  <span className="text-[var(--accent-titanium)]">{activeNode.guarantee}</span>
                </div>
              </div>
              <p className="leading-relaxed mb-2 text-xs sm:text-sm">{activeNode.details}</p>
              <div className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase">
                Role: {activeNode.role}
              </div>
            </div>
          )}
        </section>

        {/* Grounded 2x2 Architecture Breakdown */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-14">
          <div className="border-t border-[var(--border-subtle)] pt-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] mb-3 font-semibold">
              <Shield className="w-4 h-4" />
              <span>Problem Context</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              {system.deepArchitecture.challenge}
            </p>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] mb-3 font-semibold">
              <Layers className="w-4 h-4" />
              <span>System Architecture</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              {system.deepArchitecture.architecture}
            </p>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] mb-3 font-semibold">
              <Cpu className="w-4 h-4" />
              <span>Infrastructure &amp; Scaling</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              {system.deepArchitecture.scalability}
            </p>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] mb-3 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Delivery &amp; Team Scope</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              {system.deepArchitecture.verifiedOutcome}
            </p>
          </div>
        </section>

        {/* Clean Typographic Tech Stack Strip */}
        <section className="py-6 border-y border-[var(--border-hairline)] mb-12">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] mb-2.5">
            Stack Used
          </div>
          <div className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] leading-relaxed">
            {system.deepArchitecture.techStack.map((tech, idx) => (
              <React.Fragment key={tech}>
                {idx > 0 && (
                  <span className="mx-2.5 text-[var(--border-subtle)]" aria-hidden="true">
                    ·
                  </span>
                )}
                <span className="text-[var(--text-primary)]">{tech}</span>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Full-Page Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full glass-dock text-xs font-mono tracking-wider uppercase text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--surface-card-strong)] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio</span>
          </button>

          {onSelectSystem && nextSystem && nextSystem.id !== system.id && (
            <button
              onClick={() => onSelectSystem(nextSystem)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-mono font-semibold tracking-wider uppercase hover:opacity-90 transition-all"
            >
              <span>Next: {nextSystem.title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </article>
    </div>
  );
};

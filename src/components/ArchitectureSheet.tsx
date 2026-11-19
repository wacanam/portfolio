import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Share2,
  Check,
  Activity,
} from 'lucide-react';
import { flagshipSystems } from '../data/portfolio';
import { FlagshipSystem } from '../types';
import { SystemTopologySvg } from './SystemTopologySvg';

interface ArchitectureSheetProps {
  system: FlagshipSystem | null;
  initialNodeIdx?: number;
  onSelectSystem?: (system: FlagshipSystem) => void;
  onClose: () => void;
}

export const ArchitectureSheet: React.FC<ArchitectureSheetProps> = ({
  system,
  initialNodeIdx = 0,
  onSelectSystem,
  onClose,
}) => {
  const [activeNodeIdx, setActiveNodeIdx] = useState(initialNodeIdx);
  const [scenarioIdx, setScenarioIdx] = useState<0 | 1>(0);
  const [activeHopIdx, setActiveHopIdx] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset pipeline selection and scroll cleanly to top when switching systems
  useEffect(() => {
    if (!system) return;
    setActiveNodeIdx(initialNodeIdx);
    setScenarioIdx(0);
    setActiveHopIdx(null);
    setIsSimulating(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [system?.id, initialNodeIdx]);

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

  const activeScenario = system?.traceScenarios[scenarioIdx] ?? system?.traceScenarios[0];

  // Auto-step trace simulator
  useEffect(() => {
    if (!isSimulating || !activeScenario) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stepDelay = prefersReduced ? 600 : 1100;

    const timer = window.setInterval(() => {
      setActiveHopIdx((prev) => {
        const current = prev === null ? -1 : prev;
        const next = current + 1;
        if (next >= activeScenario.hops.length) {
          setIsSimulating(false);
          return prev;
        }
        const hop = activeScenario.hops[next];
        if (hop) {
          setActiveNodeIdx(hop.nodeIndex);
        }
        if (next === activeScenario.hops.length - 1) {
          setIsSimulating(false);
        }
        return next;
      });
    }, stepDelay);

    return () => window.clearInterval(timer);
  }, [isSimulating, activeScenario]);

  const handleSelectScenario = useCallback(
    (idx: 0 | 1) => {
      setScenarioIdx(idx);
      setIsSimulating(false);
      setActiveHopIdx(null);
      if (system) {
        const firstHop = system.traceScenarios[idx].hops[0];
        if (firstHop) {
          setActiveNodeIdx(firstHop.nodeIndex);
        }
      }
    },
    [system]
  );

  const handleToggleSimulate = useCallback(() => {
    if (!activeScenario) return;
    if (isSimulating) {
      setIsSimulating(false);
      return;
    }
    const firstHop = activeScenario.hops[0];
    setActiveHopIdx(0);
    if (firstHop) {
      setActiveNodeIdx(firstHop.nodeIndex);
    }
    setIsSimulating(true);
  }, [activeScenario, isSimulating]);

  const handleStepHop = useCallback(() => {
    if (!activeScenario) return;
    setIsSimulating(false);
    setActiveHopIdx((prev) => {
      const next = prev === null ? 0 : (prev + 1) % activeScenario.hops.length;
      const hop = activeScenario.hops[next];
      if (hop) {
        setActiveNodeIdx(hop.nodeIndex);
      }
      return next;
    });
  }, [activeScenario]);

  const handleResetTrace = useCallback(() => {
    setIsSimulating(false);
    setActiveHopIdx(null);
    setActiveNodeIdx(0);
  }, []);

  const handleCopyBlueprintLink = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2200);
  }, []);

  if (!system || !activeScenario) {
    return null;
  }

  const activeNode = system.nodes[activeNodeIdx] ?? system.nodes[0];
  const currentIdx = flagshipSystems.findIndex((s) => s.id === system.id);
  const nextSystem = flagshipSystems[(currentIdx + 1) % flagshipSystems.length];
  const matchedHop =
    activeScenario.hops.find((h) => h.nodeIndex === activeNodeIdx) ?? null;
  const activeTraceHop =
    activeHopIdx !== null ? activeScenario.hops[activeHopIdx] ?? null : null;

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
            <button
              type="button"
              onClick={handleCopyBlueprintLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--surface-card)] hover:bg-[var(--surface-card-strong)] border border-[var(--border-hairline)] text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Copy shareable blueprint link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3 h-3 text-[var(--accent-signal)]" />
                  <span className="text-[var(--accent-signal)]">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3 h-3 text-[var(--accent-titanium)]" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
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

        {/* 5-Node Interactive Architecture Pipeline & Request/Queue Trace */}
        <section
          className="py-4 mb-14"
          aria-label="5-Node Distributed Architecture Pipeline"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-[var(--border-hairline)]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] font-semibold">
              <Layers className="w-4 h-4" />
              <span>5-Node System Topology &amp; Request Trace</span>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              Select a stage or run a live trace scenario
            </span>
          </div>

          {/* Trace Simulation Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 p-3.5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-card)]/40">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Trace scenario selector">
              {system.traceScenarios.map((scenario, idx) => {
                const isSelectedScenario = scenarioIdx === idx;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleSelectScenario(idx as 0 | 1)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-mono transition-all border ${
                      isSelectedScenario
                        ? 'bg-[var(--surface-card-strong)] text-[var(--accent-titanium)] border-[var(--accent-titanium)] font-semibold'
                        : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]'
                    }`}
                  >
                    {scenario.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSimulate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-[11px] font-mono font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Pause Trace</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>Simulate Trace</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStepHop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dock text-[11px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Advance one hop"
              >
                <StepForward className="w-3 h-3 text-[var(--accent-titanium)]" />
                <span>Step</span>
              </button>

              {activeHopIdx !== null && (
                <button
                  type="button"
                  onClick={handleResetTrace}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-mono text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Reset trace simulation"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mb-4 px-1 leading-relaxed">
            <span className="font-mono uppercase text-[var(--accent-titanium)] mr-2">
              {activeScenario.flowSummary}:
            </span>
            {activeScenario.summary}
          </p>

          {/* Hairline SVG Architecture Schematic */}
          <SystemTopologySvg
            nodes={system.nodes}
            activeNodeIdx={activeNodeIdx}
            onSelectNode={(idx) => {
              setIsSimulating(false);
              const hopMatchIdx = activeScenario.hops.findIndex((h) => h.nodeIndex === idx);
              setActiveHopIdx(hopMatchIdx >= 0 ? hopMatchIdx : null);
              setActiveNodeIdx(idx);
            }}
            activeScenario={activeScenario}
            activeHopIdx={activeHopIdx}
          />

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mb-8">
            {system.nodes.map((node, idx) => {
              const isSelected = activeNodeIdx === idx;
              return (
                <button
                  key={node.id}
                  onClick={() => {
                    setIsSimulating(false);
                    const hopMatchIdx = activeScenario.hops.findIndex((h) => h.nodeIndex === idx);
                    setActiveHopIdx(hopMatchIdx >= 0 ? hopMatchIdx : null);
                    setActiveNodeIdx(idx);
                  }}
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
              <p className="leading-relaxed mb-3 text-xs sm:text-sm">{activeNode.details}</p>

              {/* Trace Hop Telemetry Strip */}
              <div className="mb-3 p-3 rounded-xl bg-[var(--surface-card)] border border-[var(--border-hairline)] text-xs">
                {matchedHop ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1.5 text-[var(--accent-signal)] font-semibold">
                        <Activity className="w-3.5 h-3.5" />
                        <span>
                          {activeTraceHop?.nodeIndex === activeNodeIdx ? 'ACTIVE HOP · ' : ''}
                          {matchedHop.protocol}
                        </span>
                      </span>
                      <span className="text-[var(--accent-titanium)] uppercase">
                        Stage: {matchedHop.latencyLabel}
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {matchedHop.action}
                    </p>
                  </div>
                ) : (
                  <div className="font-mono text-[11px] text-[var(--text-tertiary)]">
                    Bypassed in &ldquo;{activeScenario.label}&rdquo; — request resolves upstream without reaching this stage.
                  </div>
                )}
              </div>

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

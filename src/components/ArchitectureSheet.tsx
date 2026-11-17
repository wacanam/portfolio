import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Shield, Layers, Cpu, ArrowRight } from 'lucide-react';
import { FlagshipSystem } from '../types';

interface ArchitectureSheetProps {
  system: FlagshipSystem | null;
  onClose: () => void;
}

export const ArchitectureSheet: React.FC<ArchitectureSheetProps> = ({ system, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [cachedSystem, setCachedSystem] = useState<FlagshipSystem | null>(system);
  const [activeNodeIdx, setActiveNodeIdx] = useState(0);

  // Synchronize modal state without unmounting <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (system) {
      setCachedSystem(system);
      setActiveNodeIdx(0);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [system]);

  // Native ESC key handler
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  // Modern Web Guidance: light-dismiss fallback for clicks on dialog backdrop
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
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

  const activeNode = cachedSystem?.nodes[activeNodeIdx] ?? cachedSystem?.nodes[0];

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleClick}
      {...({ closedby: 'any' } as Record<string, unknown>)}
      className="m-auto w-[92vw] max-w-3xl rounded-3xl p-0 glass-sheet shadow-2xl focus:outline-none overflow-hidden text-[var(--text-primary)]"
    >
      {cachedSystem && (
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto overscroll-contain">
          {/* Sheet Header */}
          <div className="flex items-start justify-between gap-4 mb-6 border-b border-[var(--border-hairline)] pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono tracking-widest text-[var(--accent-titanium)] uppercase font-semibold">
                  {cachedSystem.chapter} · BLUEPRINT SPECIFICATION
                </span>
                <span className="text-xs text-[var(--border-subtle)]">·</span>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                  {cachedSystem.scaleProof}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-metallic">
                {cachedSystem.title}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                {cachedSystem.subtitle}
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close architecture sheet"
              className="p-2 rounded-full glass-dock text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Verified Engineering Outcomes: 4-Card Metrics Grid inside sheet */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {cachedSystem.metrics.map((m) => (
              <div
                key={m.label}
                className="p-3.5 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] flex flex-col justify-between"
              >
                <span className="text-xl sm:text-2xl font-bold font-mono-numbers text-[var(--text-primary)]">
                  {m.value}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {/* 5-Node Interactive Architecture Pipeline Diagram */}
          <div className="rounded-2xl p-4.5 sm:p-5 bg-[var(--surface-card)] border border-[var(--border-subtle)] mb-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>5-Node Distributed Architecture Pipeline</span>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
                Click node to inspect
              </span>
            </div>

            {/* Clickable 01 -> 05 Nodes connected by directional hairlines */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
              {cachedSystem.nodes.map((node, idx) => {
                const isSelected = activeNodeIdx === idx;
                return (
                  <button
                    key={node.id}
                    onClick={() => setActiveNodeIdx(idx)}
                    className={`text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-[var(--accent-titanium)] text-[var(--bg-primary)] font-semibold border-[var(--accent-titanium)] shadow-sm'
                        : 'bg-[var(--surface-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold tracking-wider">
                        0{idx + 1}
                      </span>
                      {idx < 4 && (
                        <ArrowRight className={`w-3 h-3 hidden sm:block ${isSelected ? 'opacity-80' : 'text-[var(--text-tertiary)] opacity-60'}`} />
                      )}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {node.name.replace(/^Node \d+:\s*/, '')}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Node Detail Inspector */}
            {activeNode && (
              <div className="p-4 rounded-xl bg-[var(--surface-card-strong)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 pb-2 border-b border-[var(--border-hairline)]">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {activeNode.name} · <span className="text-[var(--accent-titanium)]">{activeNode.tech}</span>
                  </div>
                  <div className="text-[var(--text-secondary)] font-mono text-[11px]">
                    <span className="text-[var(--text-tertiary)] uppercase mr-1">Focus:</span>
                    <span className="text-[var(--accent-titanium)]">{activeNode.guarantee}</span>
                  </div>
                </div>
                <p className="leading-relaxed mb-1">{activeNode.details}</p>
                <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase mt-1">
                  Role: {activeNode.role}
                </div>
              </div>
            )}
          </div>

          {/* Grounded Architecture Notes */}
          <div className="space-y-4 text-sm">
            {/* Problem Context */}
            <div className="rounded-2xl p-4.5 bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] mb-2 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Problem Context</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm">
                {cachedSystem.deepArchitecture.challenge}
              </p>
            </div>

            {/* System Architecture */}
            <div className="rounded-2xl p-4.5 bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] mb-2 font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>System Architecture</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm">
                {cachedSystem.deepArchitecture.architecture}
              </p>
            </div>

            {/* Infrastructure & Scaling */}
            <div className="rounded-2xl p-4.5 bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] mb-2 font-semibold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Infrastructure &amp; Scaling</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm">
                {cachedSystem.deepArchitecture.scalability}
              </p>
            </div>

            {/* Delivery & Team Scope */}
            <div className="rounded-2xl p-4.5 bg-[var(--surface-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)] mb-2 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Delivery &amp; Team Scope</span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm">
                {cachedSystem.deepArchitecture.verifiedOutcome}
              </p>
            </div>

            {/* Tech Stack Badges */}
            <div className="pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                Engineered With:
              </div>
              <div className="flex flex-wrap gap-2">
                {cachedSystem.deepArchitecture.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full text-xs font-mono glass-dock text-[var(--text-primary)] border border-[var(--border-hairline)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sheet Footer */}
          <div className="mt-8 pt-5 border-t border-[var(--border-hairline)] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold text-xs tracking-wider uppercase transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Close Specification
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
};

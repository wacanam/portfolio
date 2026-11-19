import React from 'react';
import { FlagshipSystem, TraceScenario } from '../types';

export interface SystemTopologySvgProps {
  nodes: FlagshipSystem['nodes'];
  activeNodeIdx: number;
  onSelectNode: (idx: number) => void;
  activeScenario: TraceScenario;
  activeHopIdx: number | null;
}

const NODE_CENTERS_X = [92, 276, 460, 644, 828] as const;
const BOX_W = 152;
const BOX_H = 78;
const BOX_TOP = 22;
const EDGE_Y = BOX_TOP + BOX_H / 2;

function truncateLabel(text: string, maxLen: number): string {
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

function isAsyncBoundary(a: FlagshipSystem['nodes'][number], b: FlagshipSystem['nodes'][number]): boolean {
  const combined = `${a.tech} ${a.role} ${b.tech} ${b.role}`.toLowerCase();
  return combined.includes('rabbitmq') || combined.includes('async') || combined.includes('worker');
}

export const SystemTopologySvg: React.FC<SystemTopologySvgProps> = ({
  nodes,
  activeNodeIdx,
  onSelectNode,
  activeScenario,
  activeHopIdx,
}) => {
  const scenarioNodes = new Set(activeScenario.hops.map((h) => h.nodeIndex));
  const lastHop = activeScenario.hops[activeScenario.hops.length - 1];
  const currentHop = activeHopIdx !== null ? activeScenario.hops[activeHopIdx] ?? null : null;
  const maxTraversedNode =
    activeHopIdx !== null
      ? Math.max(...activeScenario.hops.slice(0, activeHopIdx + 1).map((h) => h.nodeIndex))
      : -1;

  const isShortCircuit = lastHop && lastHop.nodeIndex < 4;
  const shortCircuitDone =
    isShortCircuit && currentHop !== null && activeHopIdx === activeScenario.hops.length - 1;

  const returnColor =
    lastHop?.outcome === 'cache-hit' ? 'var(--accent-signal)' : 'var(--accent-titanium)';

  return (
    <div
      className="w-full overflow-x-auto pb-2 mb-6 rounded-2xl border border-[var(--border-hairline)] bg-[var(--surface-card)]/40 px-3 pt-3"
      role="region"
      aria-label="Interactive system topology schematic"
    >
      <svg
        viewBox="0 0 920 166"
        className="w-full min-w-[660px] h-auto block select-none"
        role="img"
        aria-label={`5-node architectural topology for ${activeScenario.label}`}
      >
        {/* Horizontal edges connecting Stage 01 -> Stage 05 */}
        {nodes.slice(0, 4).map((node, idx) => {
          const nextNode = nodes[idx + 1];
          const x1 = NODE_CENTERS_X[idx] + BOX_W / 2;
          const x2 = NODE_CENTERS_X[idx + 1] - BOX_W / 2;
          const midX = (x1 + x2) / 2;
          const asyncEdge = isAsyncBoundary(node, nextNode);
          const edgeInScenario = scenarioNodes.has(idx as 0 | 1 | 2 | 3 | 4) && scenarioNodes.has((idx + 1) as 0 | 1 | 2 | 3 | 4);
          const edgeTraversed = edgeInScenario && maxTraversedNode >= idx + 1;
          const edgeStroke = edgeTraversed
            ? currentHop?.outcome === 'rejected' && maxTraversedNode === idx + 1
              ? 'var(--accent-titanium)'
              : 'var(--accent-signal)'
            : edgeInScenario
              ? 'var(--accent-titanium)'
              : 'var(--border-subtle)';
          const edgeOpacity = edgeTraversed ? 1 : edgeInScenario ? 0.65 : 0.28;

          return (
            <g key={`edge-${node.id}`} style={{ opacity: edgeOpacity }}>
              <line
                x1={x1}
                y1={EDGE_Y}
                x2={x2 - 2}
                y2={EDGE_Y}
                stroke={edgeStroke}
                strokeWidth={edgeTraversed ? 1.75 : 1.15}
                strokeDasharray={asyncEdge ? '4 4' : undefined}
              />
              {/* Crisp chevron arrowhead */}
              <polyline
                points={`${x2 - 6},${EDGE_Y - 3.5} ${x2 - 1},${EDGE_Y} ${x2 - 6},${EDGE_Y + 3.5}`}
                fill="none"
                stroke={edgeStroke}
                strokeWidth={edgeTraversed ? 1.75 : 1.15}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {asyncEdge && (
                <text
                  x={midX}
                  y={EDGE_Y - 8}
                  textAnchor="middle"
                  fill="var(--text-tertiary)"
                  fontSize="8.5"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  letterSpacing="0.06em"
                >
                  MQ
                </text>
              )}
            </g>
          );
        })}

        {/* Short-circuit return arc when scenario terminates before Node 05 */}
        {isShortCircuit && lastHop && (
          <g style={{ opacity: shortCircuitDone ? 1 : currentHop ? 0.45 : 0.65 }}>
            {(() => {
              const startX = NODE_CENTERS_X[lastHop.nodeIndex];
              const endX = NODE_CENTERS_X[0];
              const bottomY = BOX_TOP + BOX_H;
              const ctrlY = bottomY + 42;
              const midX = (startX + endX) / 2;
              const labelText =
                lastHop.outcome === 'cache-hit'
                  ? 'SHORT-CIRCUIT · CACHE / VECTOR HIT RETURN'
                  : 'FAST GATE · PRE-INGEST SCHEMA REJECTION';

              return (
                <>
                  <path
                    d={`M ${startX} ${bottomY} C ${startX} ${ctrlY}, ${endX} ${ctrlY}, ${endX} ${bottomY + 2}`}
                    fill="none"
                    stroke={returnColor}
                    strokeWidth={shortCircuitDone ? 1.75 : 1.15}
                    strokeDasharray={shortCircuitDone ? undefined : '5 4'}
                  />
                  <polyline
                    points={`${endX - 4},${bottomY + 8} ${endX},${bottomY + 2} ${endX + 4},${bottomY + 8}`}
                    fill="none"
                    stroke={returnColor}
                    strokeWidth={shortCircuitDone ? 1.75 : 1.15}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text
                    x={midX}
                    y={156}
                    textAnchor="middle"
                    fill={returnColor}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    letterSpacing="0.08em"
                  >
                    {labelText}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Full-flow completion caption when Scenario reaches Node 05 */}
        {!isShortCircuit && (
          <text
            x={460}
            y={144}
            textAnchor="middle"
            fill="var(--text-tertiary)"
            fontSize="9"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            letterSpacing="0.08em"
          >
            {activeScenario.flowSummary.toUpperCase()} · SOLID: SYNC · DASHED: ASYNC BROKER
          </text>
        )}

        {/* 5 Architectural Node Boxes */}
        {nodes.map((node, idx) => {
          const cx = NODE_CENTERS_X[idx];
          const x = cx - BOX_W / 2;
          const isSelected = activeNodeIdx === idx;
          const isCurrentHop = currentHop?.nodeIndex === idx;
          const inScenario = scenarioNodes.has(idx as 0 | 1 | 2 | 3 | 4);
          const wasTraversed = inScenario && maxTraversedNode >= idx;
          const shortTitle = truncateLabel(node.name.replace(/^Node \d+:\s*/, ''), 19);
          const shortTech = truncateLabel(node.tech, 21);

          const strokeColor = isCurrentHop
            ? currentHop?.outcome === 'rejected'
              ? 'var(--accent-titanium)'
              : 'var(--accent-signal)'
            : isSelected
              ? 'var(--accent-titanium)'
              : wasTraversed
                ? 'var(--accent-signal)'
                : 'var(--border-subtle)';

          const boxFill = isSelected
            ? 'var(--surface-card-strong)'
            : 'var(--bg-primary)';

          const dotColor = isCurrentHop
            ? currentHop?.outcome === 'rejected'
              ? 'var(--accent-titanium)'
              : 'var(--accent-signal)'
            : isSelected
              ? 'var(--accent-titanium)'
              : wasTraversed
                ? 'var(--accent-signal)'
                : 'var(--text-tertiary)';

          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${node.name} (${node.tech})`}
              aria-pressed={isSelected}
              onClick={() => onSelectNode(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectNode(idx);
                }
              }}
              className="cursor-pointer focus:outline-none"
              style={{ opacity: inScenario || isSelected ? 1 : 0.45 }}
            >
              <rect
                x={x}
                y={BOX_TOP}
                width={BOX_W}
                height={BOX_H}
                rx={12}
                fill={boxFill}
                stroke={strokeColor}
                strokeWidth={isSelected || isCurrentHop ? 1.65 : 1}
              />

              {/* Top stage index + live status dot */}
              <text
                x={x + 12}
                y={BOX_TOP + 20}
                fill={isSelected ? 'var(--accent-titanium)' : 'var(--text-tertiary)'}
                fontSize="10"
                fontWeight="700"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                letterSpacing="0.08em"
              >
                0{idx + 1}
              </text>

              {isCurrentHop && (
                <circle
                  cx={x + BOX_W - 14}
                  cy={BOX_TOP + 16}
                  r={7}
                  fill={dotColor}
                  opacity={0.22}
                  className="animate-ping motion-reduce:animate-none"
                  style={{ transformOrigin: `${x + BOX_W - 14}px ${BOX_TOP + 16}px` }}
                />
              )}
              <circle cx={x + BOX_W - 14} cy={BOX_TOP + 16} r={3.25} fill={dotColor} />

              {/* Primary node label */}
              <text
                x={x + 12}
                y={BOX_TOP + 43}
                fill="var(--text-primary)"
                fontSize="11.5"
                fontWeight={isSelected ? '700' : '600'}
                fontFamily="-apple-system, BlinkMacSystemFont, Inter, sans-serif"
              >
                {shortTitle}
              </text>

              {/* Tech stack subtitle */}
              <text
                x={x + 12}
                y={BOX_TOP + 62}
                fill={isSelected ? 'var(--accent-titanium)' : 'var(--text-secondary)'}
                fontSize="9.5"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >
                {shortTech}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

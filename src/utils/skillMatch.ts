import { CareerRow, FlagshipSystem } from '../types';

const STOP_TOKENS = new Set([
  'and',
  'or',
  'the',
  'for',
  'with',
  'cache',
  'storage',
  'management',
  'monitoring',
  'telemetry',
  'system',
  'systems',
  'local',
  'file',
  'auth',
  'proxy',
  'automated',
  'testing',
  'performance',
  'optimization',
  'multi-paradigm',
  'state',
  'rbac',
  'etl',
  'rag',
  'sdks',
  'sdk',
]);

/**
 * Extracts normalized searchable/comparable keywords from a skill or stack token.
 */
export function extractSkillKeywords(label: string): string[] {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return [];

  const tokens = new Set<string>([normalized]);

  // Capture parenthetical content separately from the outer phrase
  const parenMatches = [...normalized.matchAll(/\(([^)]+)\)/g)];
  for (const match of parenMatches) {
    const inner = match[1].trim();
    if (inner.length >= 2) {
      tokens.add(inner);
      for (const sub of inner.split(/[,/&+·]/)) {
        const cleanSub = sub.trim();
        if (cleanSub.length >= 2 && !STOP_TOKENS.has(cleanSub)) {
          tokens.add(cleanSub);
        }
      }
    }
  }

  const outer = normalized.replace(/\([^)]*\)/g, ' ').trim();
  if (outer.length >= 2 && !STOP_TOKENS.has(outer)) {
    tokens.add(outer);
  }

  // Split composite display tokens like "EF Core & Dapper", "Next.js & Expo", "Local / S3 / Azure"
  for (const part of outer.split(/[/,&+·]/)) {
    const cleanPart = part.trim();
    if (cleanPart.length >= 2 && !STOP_TOKENS.has(cleanPart)) {
      tokens.add(cleanPart);
    }
    // Also index meaningful multi-word prefixes/subwords when composite (e.g. "Redis Cache" -> "redis")
    const subWords = cleanPart.split(/\s+/).filter(Boolean);
    if (subWords.length > 1) {
      for (const word of subWords) {
        if (word.length >= 2 && !STOP_TOKENS.has(word)) {
          tokens.add(word);
        }
      }
    }
  }

  // Targeted domain aliases grounded in the portfolio's stack terminology
  if (normalized.includes('minimal apis')) {
    tokens.add('asp.net core');
    tokens.add('.net minimal apis');
    tokens.add('minimal apis');
  }
  if (normalized.includes('aws s3') || normalized === 's3') {
    tokens.add('aws s3');
    tokens.add('s3');
  }
  if (normalized.includes('azure blob') || normalized === 'azure') {
    tokens.add('azure blob');
    tokens.add('azure blob storage');
    tokens.add('azure');
  }
  if (normalized.includes('rabbitmq')) {
    tokens.add('rabbitmq');
  }
  if (normalized.includes('keycloak')) {
    tokens.add('keycloak');
  }
  if (normalized.includes('pgvector')) {
    tokens.add('pgvector');
  }
  if (normalized.includes('retrieval-augmented generation')) {
    tokens.add('pgvector rag');
    tokens.add('rag');
  }
  if (normalized.includes('nginx')) {
    tokens.add('nginx');
  }
  if (normalized.includes('expo')) {
    tokens.add('react native (expo)');
    tokens.add('expo');
  }
  if (normalized.includes('e2ee')) {
    tokens.add('e2ee');
    tokens.add('end-to-end encryption');
  }

  return [...tokens];
}

/**
 * Checks whether two skill or stack tokens refer to the same technology/competency.
 */
export function skillsMatch(a: string, b: string): boolean {
  const normA = a.trim().toLowerCase();
  const normB = b.trim().toLowerCase();
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const keysA = new Set(extractSkillKeywords(normA));
  for (const keyB of extractSkillKeywords(normB)) {
    if (keysA.has(keyB)) {
      return true;
    }
  }
  return false;
}

/**
 * Resolves a URL ?skill= parameter back to its canonical skill label when available.
 */
export function resolveCanonicalSkill(raw: string | null, allSkills: string[]): string | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  const exact = allSkills.find((s) => s.toLowerCase() === lower);
  if (exact) return exact;

  const fuzzy = allSkills.find((s) => skillsMatch(s, trimmed));
  return fuzzy ?? trimmed;
}

/**
 * Checks whether a FlagshipSystem uses the given skill across display tokens, tech stack, or nodes.
 */
export function systemMatchesSkill(
  system: FlagshipSystem,
  displayTokens: string[],
  selectedSkill: string | null
): boolean {
  if (!selectedSkill) return false;
  const candidates = [
    ...displayTokens,
    ...system.deepArchitecture.techStack,
    ...system.nodes.map((node) => node.tech),
  ];
  return candidates.some((token) => skillsMatch(token, selectedSkill));
}

/**
 * Checks whether a CareerRow lists the given skill in its technologies array.
 */
export function careerMatchesSkill(row: CareerRow, selectedSkill: string | null): boolean {
  if (!selectedSkill) return false;
  return row.technologies.some((tech) => skillsMatch(tech, selectedSkill));
}

/**
 * Builds a clean shareable URL preserving origin + path with an optional ?skill= filter.
 */
export function buildSkillShareUrl(skill: string | null): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  if (skill) {
    url.searchParams.set('skill', skill);
  }
  url.hash = '#stack';
  return url.toString();
}

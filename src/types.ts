export interface CareerRow {
  id: string;
  period: string;
  role: string;
  company: string;
  location: string;
  model: string;
  summary: string;
  technologies: string[];
  isEducation?: boolean;
}

export interface SystemNode {
  id: string;
  name: string;
  role: string;
  tech: string;
  details: string;
  guarantee: string;
}

export interface TraceHop {
  nodeIndex: 0 | 1 | 2 | 3 | 4;
  protocol: string;
  latencyLabel: string;
  action: string;
  outcome: 'pass' | 'cache-hit' | 'async-queued' | 'rejected';
}

export interface TraceScenario {
  id: string;
  label: string;
  summary: string;
  flowSummary: string;
  hops: TraceHop[];
}

export interface FlagshipSystem {
  id: string;
  chapter: string;
  formationIndex: 1 | 2 | 3;
  title: string;
  subtitle: string; // <= 16 words!
  scaleProof: string;
  metrics: { label: string; value: string }[];
  nodes: [SystemNode, SystemNode, SystemNode, SystemNode, SystemNode];
  traceScenarios: [TraceScenario, TraceScenario];
  deepArchitecture: {
    challenge: string;
    architecture: string;
    scalability: string;
    verifiedOutcome: string;
    techStack: string[];
  };
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ContactInfo {
  name: string;
  headline: string;
  email: string;
  phone: string;
  whatsappUrl: string;
  viberUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  location: string;
  availability: string;
  resumeUrl: string;
}

import { CareerRow, FlagshipSystem, SkillCategory, ContactInfo } from '../types';

export const contactData: ContactInfo = {
  name: 'Wave Cantery Ambray',
  headline: 'Full-Stack & Backend Software Engineer',
  email: 'wacanam20@gmail.com',
  phone: '+63 965 429 7640',
  whatsappUrl: 'https://wa.me/639654297640',
  viberUrl: 'viber://chat?number=%2B639654297640',
  githubUrl: 'https://github.com/wacanam',
  linkedinUrl: 'https://linkedin.com/in/wave-ambray-a37736161',
  location: 'Cagayan de Oro City, Northern Mindanao, Philippines (UTC+8)',
  availability: 'Available for Remote Roles Worldwide',
  resumeUrl: `${import.meta.env.BASE_URL}wave_ambray_resume.pdf`,
};

export const flagshipSystems: FlagshipSystem[] = [
  {
    id: 'system-broadband',
    chapter: 'Chapter 02',
    formationIndex: 1,
    title: 'National Broadband Mapping & Telecom QoS',
    subtitle: 'Nationwide regulatory QoS and broadband mapping across 42,000+ geometries and 100M+ spatial points.', // 13 words <= 16
    scaleProof: '100M+ Spatial Points · 42,000+ Geometries',
    metrics: [
      { label: 'Spatial Points', value: '100M+' },
      { label: 'Spatial Geometries', value: '42,000+' },
      { label: 'Data Access', value: 'EF Core + Dapper' },
      { label: 'Team Scope', value: '6-Member Lead' },
    ],
    nodes: [
      {
        id: 'node-map-client',
        name: 'Node 01: React & TypeScript Web UI',
        role: 'Geospatial Web Client',
        tech: 'React.js & TypeScript',
        details: 'Interactive mapping views and analytical filters for inspecting regional broadband coverage and administrative boundaries.',
        guarantee: 'Viewport-scoped spatial queries',
      },
      {
        id: 'node-nginx-proxy',
        name: 'Node 02: Nginx & Keycloak RBAC',
        role: 'Ingress & Access Control',
        tech: 'Nginx & Keycloak',
        details: 'Reverse proxy routing, SSL/TLS management, and role-based access control across regulatory stakeholders.',
        guarantee: 'Role-scoped institutional access',
      },
      {
        id: 'node-aspnet-core',
        name: 'Node 03: ASP.NET Core APIs',
        role: 'Application & Query Layer',
        tech: 'C# / ASP.NET Core',
        details: 'Pairs EF Core for domain workflows with Dapper SQL queries on read-heavy spatial aggregations.',
        guarantee: 'Split read/write ORM data access',
      },
      {
        id: 'node-redis-cache',
        name: 'Node 04: Redis Cache',
        role: 'Read-Through Cache',
        tech: 'Redis',
        details: 'Caches frequent regional summaries and boundary lookups so repeated map inspections avoid redundant database hits.',
        guarantee: 'Reduced PostgreSQL read load',
      },
      {
        id: 'node-postgis',
        name: 'Node 05: PostgreSQL + PostGIS',
        role: 'Spatial Relational Store',
        tech: 'PostgreSQL & PostGIS',
        details: 'Stores and indexes 42,000+ administrative boundary geometries alongside 100M+ growing QoS telemetry points.',
        guarantee: 'PostGIS indexed spatial queries',
      },
    ],
    deepArchitecture: {
      challenge: 'Supporting nationwide regulatory QoS reporting and broadband mapping across 42,000+ spatial geometries and over 100M growing spatial data points without bogging down analytical reads.',
      architecture: 'Architected a C# / ASP.NET Core backend that pairs EF Core for standard domain operations with Dapper over PostGIS spatial indexes for heavy analytical queries, fronted by React, TypeScript, and Nginx.',
      scalability: 'Added Redis caching for recurring regional lookups and hardened hybrid infrastructure with Keycloak RBAC and Dozzle container log monitoring.',
      verifiedOutcome: 'Led a 6-member team (4 junior engineers and 2 QA specialists) to production delivery through architectural code reviews, xUnit/NUnit tests, automated E2E gates, and stakeholder sign-offs.',
      techStack: ['C#', 'ASP.NET Core', 'EF Core', 'Dapper', 'PostgreSQL', 'PostGIS', 'Redis', 'Keycloak', 'React.js', 'TypeScript', 'Nginx', 'Docker', 'Dozzle'],
    },
  },
  {
    id: 'system-clinic-erp',
    chapter: 'Chapter 03',
    formationIndex: 2,
    title: 'Clinic EZ & ERP EZ Multi-Tenant Suite',
    subtitle: 'Multi-tenant clinical EHR/EMR and ERP across hybrid cloud and on-premise deployments.', // 11 words <= 16
    scaleProof: '20,000+ Users · 100–300 DAUs · E2EE',
    metrics: [
      { label: 'Supported Users', value: '20,000+' },
      { label: 'Daily Active Users', value: '100–300' },
      { label: 'Deployments', value: 'Cloud & On-Prem' },
      { label: 'Team Mentored', value: '7 Engineers & QA' },
    ],
    nodes: [
      {
        id: 'node-offline-first',
        name: 'Node 01: Next.js & Expo Clients',
        role: 'Web & Mobile Clients',
        tech: 'Next.js & React Native (Expo)',
        details: 'Cross-platform clinical and ERP interfaces with offline-first client synchronization and end-to-end encrypted (E2EE) telemedicine payloads.',
        guarantee: 'Offline-first sync & E2EE payloads',
      },
      {
        id: 'node-dotnet-services',
        name: 'Node 02: .NET Minimal APIs & Node.js',
        role: 'Modular Monolith & Services',
        tech: 'C#/.NET Minimal APIs & Node.js',
        details: 'Service boundaries across modular monolith and microservice topologies driving configurable state-machine workflows and strict XML/PDF serialization.',
        guarantee: 'Configurable workflows & XML/PDF',
      },
      {
        id: 'node-rabbitmq-broker',
        name: 'Node 03: RabbitMQ & Redis',
        role: 'Messaging & Cache Layer',
        tech: 'RabbitMQ & Redis',
        details: 'RabbitMQ brokers background clinical/ERP tasks while Redis caches hot multi-tenant application state.',
        guarantee: 'Decoupled background processing',
      },
      {
        id: 'node-pgvector-rag',
        name: 'Node 04: PostgreSQL + pgvector RAG',
        role: 'Tenant Store & Semantic Search',
        tech: 'PostgreSQL, pgvector & AI SDKs',
        details: 'Tenant-isolated PostgreSQL persistence paired with pgvector similarity search and Vercel, Google, and Microsoft AI SDKs for RAG workflows.',
        guarantee: 'Tenant isolation & RAG retrieval',
      },
      {
        id: 'node-storage-ci',
        name: 'Node 05: Docker, Nginx & CI/CD',
        role: 'Deployment & Observability',
        tech: 'Docker, Nginx, GitHub Actions & Vercel',
        details: 'Automated CI/CD with wildcard SSL/TLS routing, Dozzle container logging, Hotjar UX telemetry, and xUnit/NUnit + E2E quality gates.',
        guarantee: 'Automated CI/CD & live telemetry',
      },
    ],
    deepArchitecture: {
      challenge: 'Delivering multi-tenant EHR/EMR (Clinic EZ) and ERP (ERP EZ) platforms across both private clinic cloud environments and on-premise university deployments with offline resilience and clinical data privacy.',
      architecture: 'Served as Lead Developer and System Architect across Modular Monolith and Microservices topologies using C#/.NET Minimal APIs, Node.js, Next.js, and React Native (Expo), backed by tenant-isolated PostgreSQL, E2EE payloads, offline-first sync, and XML/PDF serialization.',
      scalability: 'Integrated RabbitMQ and Redis for async workloads, added RAG search with PostgreSQL pgvector and Vercel/Google/Microsoft AI SDKs, and automated Docker, Nginx wildcard SSL/TLS, GitHub Actions, Vercel, Dozzle, and Hotjar pipelines.',
      verifiedOutcome: 'Supports 20,000+ users and 100–300 daily active users in production while mentoring a 7-member team (4 junior engineers, 1 QA, 2 interns) using Clean Architecture templates and xUnit/NUnit/E2E gates.',
      techStack: ['C#', '.NET Minimal APIs', 'Node.js', 'Next.js', 'React Native (Expo)', 'PostgreSQL', 'pgvector', 'RabbitMQ', 'Redis', 'Docker', 'Nginx', 'GitHub Actions', 'Vercel', 'Dozzle', 'Hotjar'],
    },
  },
  {
    id: 'system-edcs',
    chapter: 'Chapter 04',
    formationIndex: 3,
    title: 'Higher-Ed & Regulatory Institutional ETL',
    subtitle: 'Asynchronous RabbitMQ ETL workers and schema validation pipelines serving nationwide SUCs and HEIs.', // 13 words <= 16
    scaleProof: 'Nationwide SUCs & HEIs · Async RabbitMQ ETL',
    metrics: [
      { label: 'Institutions', value: 'Nationwide SUCs/HEIs' },
      { label: 'Worker Queue', value: 'RabbitMQ ETL' },
      { label: 'Storage Targets', value: 'Local · S3 · Azure' },
      { label: 'Identity & Auth', value: 'Keycloak RBAC' },
    ],
    nodes: [
      {
        id: 'node-json-schema',
        name: 'Node 01: Institutional Submission UI',
        role: 'Submission & Review Portal',
        tech: 'React.js & TypeScript',
        details: 'Web workflows for institutional dataset uploads, validation feedback, and stakeholder review across SUCs and HEIs.',
        guarantee: 'Structured institutional intake',
      },
      {
        id: 'node-keycloak-auth',
        name: 'Node 02: Keycloak & Nginx Ingress',
        role: 'Authentication & Proxy',
        tech: 'Keycloak & Nginx',
        details: 'Role-based access control and reverse-proxied API routing isolating permissions per institution and reviewer role.',
        guarantee: 'Scoped RBAC authorization',
      },
      {
        id: 'node-fsm-engine',
        name: 'Node 03: ASP.NET Core Validation',
        role: 'Schema Validation Layer',
        tech: 'C# / ASP.NET Core',
        details: 'Validates uploaded institutional submissions against required reporting schemas before queueing downstream ETL jobs.',
        guarantee: 'Pre-ingest schema validation',
      },
      {
        id: 'node-rabbitmq-ingest',
        name: 'Node 04: RabbitMQ ETL Workers',
        role: 'Asynchronous Ingestion',
        tech: 'RabbitMQ & .NET Workers',
        details: 'Background worker queues process heavy batch institutional imports asynchronously outside request/response cycles.',
        guarantee: 'Non-blocking batch processing',
      },
      {
        id: 'node-hybrid-cloud',
        name: 'Node 05: Pluggable Storage Adapters',
        role: 'Multi-Backend Storage',
        tech: 'Local FS, AWS S3 & Azure Blob',
        details: 'Pluggable storage abstraction writing validated institutional artifacts to Local File Systems, AWS S3, or Azure Blob Storage.',
        guarantee: 'Portable hybrid storage adapters',
      },
    ],
    deepArchitecture: {
      challenge: 'Ingesting and validating large institutional reporting submissions across nationwide State Universities and Colleges (SUCs) and Higher Education Institutions (HEIs) across varied deployment storage targets.',
      architecture: 'Built asynchronous institutional ETL workers and schema validation pipelines in ASP.NET Core and RabbitMQ behind Nginx proxy management and Keycloak RBAC.',
      scalability: 'Implemented pluggable storage adapters supporting Local File Systems, AWS S3, and Azure Blob Storage alongside Dozzle container log monitoring.',
      verifiedOutcome: 'Delivered reliable nationwide institutional ingestion with xUnit, NUnit, and automated E2E release gates, architectural code reviews, and stakeholder sign-offs across a 6-member team.',
      techStack: ['C#', 'ASP.NET Core', 'RabbitMQ', 'Local File System', 'AWS S3', 'Azure Blob Storage', 'Keycloak', 'React.js', 'TypeScript', 'PostgreSQL', 'Nginx', 'Docker', 'Dozzle'],
    },
  },
];

export const skillCategories: SkillCategory[] = [
  {
    id: 'all',
    name: 'All',
    skills: [
      'C#', 'ASP.NET Core (Minimal APIs)', 'EF Core', 'Dapper', 'TypeScript', 'Node.js',
      'Express.js', 'Prisma', 'Drizzle ORM', 'SQL', 'RabbitMQ', 'Redis Cache',
      'Clean Architecture', 'Modular Monolith', 'Event-Driven Microservices', 'Distributed Systems',
      'REST APIs', 'Webhooks', 'React.js', 'Next.js', 'React Native (Expo)',
      'Multi-Paradigm State Management', 'Offline-First Sync', 'End-to-End Encryption (E2EE)',
      'HTML5', 'CSS3/Tailwind', 'Performance Optimization', 'PostgreSQL (PostGIS, pgvector)',
      'MS SQL Server', 'Cloud Firestore', 'Retrieval-Augmented Generation (RAG)',
      'Vercel / Google / Microsoft AI SDKs', 'Claude Code', 'Antigravity', 'Codex',
      'GitHub Copilot', 'xUnit', 'NUnit', 'E2E Automated Testing', 'Docker',
      'Nginx Proxy Management', 'Kubernetes', 'GitHub Actions', 'AWS S3', 'Azure Blob',
      'Dozzle Container Monitoring', 'Hotjar Telemetry', 'Keycloak', 'Clerk Auth'
    ],
  },
  {
    id: 'backend',
    name: 'Backend & Distributed',
    skills: [
      'C#', 'ASP.NET Core (Minimal APIs)', 'EF Core', 'Dapper', 'TypeScript', 'Node.js',
      'Express.js', 'Prisma', 'Drizzle ORM', 'SQL', 'RabbitMQ', 'Redis Cache',
      'Clean Architecture', 'Modular Monolith', 'Event-Driven Microservices', 'Distributed Systems',
      'REST APIs', 'Webhooks'
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend & Offline-First',
    skills: [
      'React.js', 'Next.js', 'React Native (Expo)', 'Multi-Paradigm State Management',
      'Offline-First Sync', 'End-to-End Encryption (E2EE)', 'HTML5', 'CSS3/Tailwind',
      'Performance Optimization'
    ],
  },
  {
    id: 'data-ai',
    name: 'Data, Spatial & AI',
    skills: [
      'PostgreSQL (PostGIS, pgvector)', 'MS SQL Server', 'Cloud Firestore',
      'Retrieval-Augmented Generation (RAG)', 'Vercel / Google / Microsoft AI SDKs',
      'Claude Code', 'Antigravity', 'Codex', 'GitHub Copilot'
    ],
  },
  {
    id: 'devops-testing',
    name: 'Testing & DevOps',
    skills: [
      'xUnit', 'NUnit', 'E2E Automated Testing', 'Docker', 'Nginx Proxy Management',
      'Kubernetes', 'GitHub Actions', 'AWS S3', 'Azure Blob',
      'Dozzle Container Monitoring', 'Hotjar Telemetry', 'Keycloak', 'Clerk Auth'
    ],
  },
];

export const careerData: CareerRow[] = [
  {
    id: 'career-1',
    period: '03/2026 – Present',
    role: 'Senior Software Engineer (Full-Time)',
    company: 'Nextstep Software Corporation',
    location: 'Cagayan de Oro City, PH',
    model: 'Hybrid',
    summary: 'Lead Developer & System Architect for flagship multi-tenant EHR/EMR (Clinic EZ) and ERP (ERP EZ) across Modular Monolith and Microservices using C#/.NET Minimal APIs, Node.js, RabbitMQ, Redis. Supports 20K+ users and 100–300 DAUs on Next.js and Expo. Built tenant-isolated PostgreSQL, E2EE, offline sync, RAG with pgvector, and automated Docker/Nginx/GitHub Actions/Dozzle CI/CD. Mentored 7-member engineering team.',
    technologies: ['C#', 'ASP.NET Core (Minimal APIs)', 'Node.js', 'Next.js', 'React Native (Expo)', 'RabbitMQ', 'Redis Cache', 'PostgreSQL (PostGIS, pgvector)', 'Docker', 'GitHub Actions', 'Offline-First Sync', 'End-to-End Encryption (E2EE)'],
  },
  {
    id: 'career-2',
    period: '01/2025 – 03/2026',
    role: 'Senior Technical Specialist (Contract)',
    company: 'University of Science and Technology of Southern Philippines (USTP)',
    location: 'Cagayan de Oro City, PH',
    model: 'Hybrid',
    summary: 'Architected nationwide regulatory QoS and National Broadband Mapping platform using ASP.NET Core, EF Core, Dapper, PostGIS spatial indexing, and Redis caching across 42,000+ geometries and 100M+ spatial points. Built async ETL workers and validation with RabbitMQ and pluggable storage (Local, AWS S3, Azure Blob) for SUCs/HEIs nationwide. Hardened Keycloak RBAC; led 6-member team.',
    technologies: ['C#', 'ASP.NET Core (Minimal APIs)', 'EF Core', 'Dapper', 'PostgreSQL (PostGIS, pgvector)', 'Redis Cache', 'RabbitMQ', 'Keycloak', 'AWS S3', 'Azure Blob', 'Docker', 'Nginx Proxy Management'],
  },
  {
    id: 'career-3',
    period: '04/2024 – 12/2024',
    role: 'Full Stack Engineer (Full-Time)',
    company: 'PointersBit Inc.',
    location: 'Cagayan de Oro City, PH',
    model: 'Hybrid',
    summary: 'Architected full-stack web features and front-end engineering standards across client platforms, enforcing strict PR review gates, modular component design, and agentic AI-assisted development guardrails. Delivered low-latency, responsive React and TypeScript applications with scalable client and server-state management.',
    technologies: ['React.js', 'TypeScript', 'Node.js', 'Performance Optimization', 'Multi-Paradigm State Management', 'E2E Automated Testing', 'HTML5', 'CSS3/Tailwind'],
  },
  {
    id: 'career-4',
    period: '02/2023 – 04/2024',
    role: 'Full Stack Engineer (Full-Time)',
    company: 'Spearhead Software',
    location: 'New York, USA',
    model: 'Remote',
    summary: 'Engineered distributed backend services and RESTful APIs using Clean Architecture, C#/.NET, Node.js, Prisma, and Drizzle ORM alongside AWS S3 and Azure Blob storage for US client platforms. Built fast-loading React and TypeScript interfaces with offline-resilient caching and encrypted payloads.',
    technologies: ['C#', 'ASP.NET Core (Minimal APIs)', 'Clean Architecture', 'Node.js', 'Prisma', 'Drizzle ORM', 'AWS S3', 'Azure Blob', 'React.js', 'TypeScript', 'REST APIs'],
  },
  {
    id: 'career-5',
    period: '06/2022 – 02/2023',
    role: 'Software Engineer (Full-Time)',
    company: 'BenManage',
    location: 'Israel',
    model: 'Remote',
    summary: 'Developed and maintained a live production enterprise benefits administration platform within an agile Israeli engineering team, shipping new modules with strict backward compatibility across active client deployments. Delivered non-breaking backend API integrations and additive SQL schema migrations.',
    technologies: ['C#', 'SQL', 'MS SQL Server', 'REST APIs', 'Modular Monolith', 'TypeScript', 'React.js'],
  },
  {
    id: 'career-6',
    period: '08/2021 – 07/2022',
    role: 'Computer Programmer 2 (Contract)',
    company: 'University of Science and Technology of Southern Philippines (USTP)',
    location: 'Cagayan de Oro City, PH',
    model: 'On-Site & Hybrid',
    summary: 'Promoted from Computer Researcher 2. Developed and maintained campus-wide academic and administrative web/mobile applications, relational database workflows, and internal automation systems using C#, React.js, React Native, and SQL.',
    technologies: ['C#', 'React.js', 'React Native (Expo)', 'SQL', 'REST APIs', 'HTML5', 'CSS3/Tailwind'],
  },
  {
    id: 'career-7',
    period: '02/2020 – 07/2021',
    role: 'Computer Researcher 2 (Contract)',
    company: 'University of Science and Technology of Southern Philippines (USTP)',
    location: 'Cagayan de Oro City, PH',
    model: 'On-Site & Hybrid',
    summary: 'Spearheaded institutional systems research, data modeling, automated ETL pipelines, and internal university application platforms with C#, SQL, and React.js.',
    technologies: ['C#', 'SQL', 'React.js', 'HTML5', 'REST APIs'],
  },
  {
    id: 'career-8',
    period: '2015 – 2020',
    role: 'Bachelor of Science in Electronics and Communications Engineering (BS ECE)',
    company: 'University of Science and Technology of Southern Philippines (USTP)',
    location: 'Cagayan de Oro City, PH',
    model: 'On-Campus',
    summary: 'Completed 5-year rigorous engineering curriculum. Active Contributor to Northern Mindanao ICT Startup Ecosystem. Foundation in digital signal processing, telecommunications, microprocessors, and distributed networks.',
    technologies: ['Distributed Systems', 'SQL', 'Clean Architecture'],
    isEducation: true,
  },
];

export const careerTimeline = careerData;

export const portfolio = {
  contactData,
  flagshipSystems,
  skillCategories,
  careerData,
  careerTimeline,
};
export default portfolio;

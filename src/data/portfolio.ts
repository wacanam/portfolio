import { CareerRow, FlagshipSystem, SkillCategory, ContactInfo } from '../types';

export const contactData: ContactInfo = {
  name: 'Wave C. Ambray',
  headline: 'Senior Full-Stack & Backend Software Engineer',
  email: 'wacanam20@gmail.com',
  phone: '+63 965 429 7640',
  whatsappUrl: 'https://wa.me/639654297640',
  viberUrl: 'viber://chat?number=%2B639654297640',
  githubUrl: 'https://github.com/wacanam',
  linkedinUrl: 'https://linkedin.com/in/wave-ambray-a37736161',
  location: 'Cagayan de Oro City, Northern Mindanao, Philippines (UTC+8)',
  availability: 'Available for Remote Roles Worldwide',
  resumeUrl: '/wave_ambray_resume.pdf',
};

export const flagshipSystems: FlagshipSystem[] = [
  {
    id: 'system-broadband',
    chapter: 'Chapter 02',
    formationIndex: 1,
    title: 'National Broadband Mapping & Telecom QoS',
    subtitle: 'Nationwide regulatory geospatial intelligence engineered for sub-second query execution.', // 9 words <= 16
    scaleProof: '100M+ Spatial Points · 42,000+ Polygons',
    metrics: [
      { label: 'Spatial Points', value: '100M+' },
      { label: 'Boundary Polygons', value: '42,000+' },
      { label: 'Query Latency', value: '< 250ms' },
      { label: 'Archipelago Coverage', value: '100%' },
    ],
    nodes: [
      {
        id: 'node-map-client',
        name: 'Node 01: Vector Map Client',
        role: 'Edge Vector Client',
        tech: 'MapLibre GL & TypeScript',
        details: 'Dynamic bounding-box viewport queries, client-side point clustering, and offline vector tile caching.',
        guarantee: '60fps pan/zoom with zero frame drops',
      },
      {
        id: 'node-nginx-proxy',
        name: 'Node 02: Nginx Reverse Proxy',
        role: 'Edge Ingress Gateway',
        tech: 'Nginx, HTTP/2 & Brotli',
        details: 'Edge SSL/TLS termination, rate limiting, brotli compression, and spatial micro-caching for repeated tile queries.',
        guarantee: '10,000+ concurrent tile requests sustained',
      },
      {
        id: 'node-aspnet-core',
        name: 'Node 03: ASP.NET Core Minimal APIs',
        role: 'High-Throughput Compute',
        tech: 'C# / .NET 8 Minimal APIs',
        details: 'EF Core + Dapper dual ORM query routing, async pipeline workers, and pooled database connections.',
        guarantee: 'Sub-15ms compute pipeline overhead',
      },
      {
        id: 'node-redis-cache',
        name: 'Node 04: Redis Distributed Cache',
        role: 'Spatial In-Memory Cache',
        tech: 'Redis Cluster & Geohash',
        details: 'Geohash-keyed boundary result caching with automated cache invalidation upon batch telemetry ingest.',
        guarantee: '94% cache hit ratio across public maps',
      },
      {
        id: 'node-postgis',
        name: 'Node 05: PostgreSQL + PostGIS',
        role: 'Spatial Persistence Core',
        tech: 'PostgreSQL 16 & PostGIS',
        details: 'GiST/SP-GiST spatial indexing, ST_Intersects and ST_Contains queries over 42,000+ administrative boundary polygons.',
        guarantee: 'Sub-second spatial polygon intersections',
      },
    ],
    deepArchitecture: {
      challenge: 'Ingesting, normalizing, and querying over 100 million telecommunications QoS telemetry data points across 42,000+ complex territorial boundary polygons throughout the Philippine archipelago with sub-second response times.',
      architecture: 'Built a decoupled distributed pipeline pairing high-throughput C# ASP.NET Core Minimal APIs with Redis geohash clustering and PostGIS spatial indexing. Implemented asynchronous RabbitMQ ingest workers with pluggable cloud storage adapters for raw telemetry payloads.',
      scalability: 'Engineered hybrid ORM routing with Dapper for ultra-fast spatial bounding-box reads and EF Core for transactional compliance. Implemented Nginx edge tile micro-caching to sustain peak traffic without saturating the primary relational engine.',
      verifiedOutcome: 'Sub-second analytical query execution across nationwide datasets with 99.9% uptime, serving national regulatory and higher education oversight bodies.',
      techStack: ['C#', '.NET 8', 'PostgreSQL', 'PostGIS', 'Redis', 'RabbitMQ', 'React', 'TypeScript', 'Nginx', 'Docker'],
    },
  },
  {
    id: 'system-clinic-erp',
    chapter: 'Chapter 03',
    formationIndex: 2,
    title: 'Clinic EZ & ERP EZ Enterprise Suite',
    subtitle: 'Multi-tenant healthcare EHR/EMR and enterprise platform across hybrid cloud and on-premise deployments.', // 12 words <= 16
    scaleProof: '20,000+ Users · 100–300 DAUs · E2EE',
    metrics: [
      { label: 'Registered Patients/Users', value: '20,000+' },
      { label: 'Daily Active Users', value: '100–300' },
      { label: 'Tenant Isolation', value: 'Schema-Level' },
      { label: 'Payload Encryption', value: 'AES-256-GCM' },
    ],
    nodes: [
      {
        id: 'node-offline-first',
        name: 'Node 01: Next.js & Expo Client',
        role: 'Unified Offline-First Client',
        tech: 'Next.js 14, React Native (Expo)',
        details: 'Optimistic UI mutations, encrypted SQLite client storage, background delta synchronization, and biometric auth.',
        guarantee: 'Zero clinic disruption during network outages',
      },
      {
        id: 'node-dotnet-services',
        name: 'Node 02: .NET Core & Node Services',
        role: 'Modular Microservices Gateway',
        tech: 'C# ASP.NET Core, Node.js',
        details: 'Modular monolith and microservices API gateway, RBAC authorization, E2EE payload validation, and PDF report generators.',
        guarantee: 'Strict sub-50ms API response SLA',
      },
      {
        id: 'node-rabbitmq-broker',
        name: 'Node 03: RabbitMQ + Redis',
        role: 'Asynchronous State Broker',
        tech: 'RabbitMQ AMQP, Redis State',
        details: 'Asynchronous background queues, dead-letter retries, and distributed session token validation.',
        guarantee: 'Zero lost clinical events via retry queues',
      },
      {
        id: 'node-pgvector-rag',
        name: 'Node 04: PostgreSQL + pgvector',
        role: 'Relational & Semantic Store',
        tech: 'PostgreSQL, pgvector, AI SDK',
        details: 'Tenant-isolated relational schemas, vector embeddings for clinical records, and semantic search.',
        guarantee: 'Sub-second clinical document retrieval',
      },
      {
        id: 'node-storage-ci',
        name: 'Node 05: Pluggable Storage & CI Gates',
        role: 'Durable Storage & Release',
        tech: 'AWS S3, Azure Blob, GitHub Actions',
        details: 'Multi-cloud storage abstraction adapters with automated xUnit, NUnit, and Playwright E2E release gates.',
        guarantee: '100% automated release gate compliance',
      },
    ],
    deepArchitecture: {
      challenge: 'Architecting a mission-critical EHR/EMR and ERP suite requiring zero data loss during clinic network dropouts, strict tenant isolation across public hospitals and private practices, and sub-second clinical document retrieval.',
      architecture: 'Engineered an offline-first mobile/web application with encrypted local SQLite persistence and bidirectional delta-synchronization. Backed by C# ASP.NET Core and Node.js microservices with tenant-isolated PostgreSQL schemas.',
      scalability: 'Integrated pgvector and AI SDKs for semantic clinical history retrieval, paired with RabbitMQ message queues to isolate heavy report generation from transaction processing.',
      verifiedOutcome: 'Flawless daily operation for 20,000+ users and 100–300 DAUs, eliminating clinic administrative bottlenecks and securing confidential medical records with E2EE.',
      techStack: ['C#', '.NET Core', 'Next.js', 'Expo', 'PostgreSQL', 'pgvector', 'RabbitMQ', 'Redis', 'Docker', 'GitHub Actions'],
    },
  },
  {
    id: 'system-edcs',
    chapter: 'Chapter 04',
    formationIndex: 3,
    title: 'Nationwide Higher-Ed & Regulatory Data Engine',
    subtitle: 'Metadata-driven institutional evaluation and async ingestion engine serving Philippine higher education.', // 11 words <= 16
    scaleProof: 'Nationwide SUCs & HEIs · Deterministic FSM',
    metrics: [
      { label: 'Institutional Reach', value: 'Nationwide' },
      { label: 'Schema Validation', value: '100% Deterministic' },
      { label: 'State Transitions', value: 'Zero Deadlocks' },
      { label: 'Audit Trail', value: 'Cryptographic Log' },
    ],
    nodes: [
      {
        id: 'node-json-schema',
        name: 'Node 01: JSON-Schema Form Engine',
        role: 'Metadata-Driven Client Engine',
        tech: 'React, TypeScript, JSON Schema',
        details: 'Dynamic metadata-driven schema evaluation, client-side real-time validation, and nested form rendering.',
        guarantee: 'Zero client-side schema drift',
      },
      {
        id: 'node-fsm-engine',
        name: 'Node 02: State-Machine Evaluator',
        role: 'Deterministic Workflow Engine',
        tech: 'Finite-State Machine Matrix',
        details: 'Multi-stage institutional approval matrices, multi-signature state transition audit trails.',
        guarantee: 'Strict mathematical state safety',
      },
      {
        id: 'node-rabbitmq-ingest',
        name: 'Node 03: RabbitMQ Ingestion Pipeline',
        role: 'High-Volume Ingestion Broker',
        tech: 'RabbitMQ & Backpressure Pool',
        details: 'High-throughput batch submission queues, asynchronous ETL worker pool, and backpressure protection.',
        guarantee: 'Zero queue overflow during deadline surges',
      },
      {
        id: 'node-keycloak-auth',
        name: 'Node 04: ASP.NET Core + Keycloak',
        role: 'Enterprise Identity Federation',
        tech: 'ASP.NET Core, Keycloak OIDC',
        details: 'Enterprise OpenID Connect / OAuth2 identity federation, multi-tenant RBAC, and granular API scopes.',
        guarantee: 'Enterprise-grade regulatory audit logging',
      },
      {
        id: 'node-hybrid-cloud',
        name: 'Node 05: Hybrid Cloud Infrastructure',
        role: 'Storage & Federation Tier',
        tech: 'Local Institutional Nodes, S3, Azure',
        details: 'Institutional on-premise compute nodes securely federated with cloud archival tiers for long-term audit preservation.',
        guarantee: 'Tamper-evident regulatory data retention',
      },
    ],
    deepArchitecture: {
      challenge: 'Standardizing regulatory data submissions and accreditation audits across diverse Philippine State Universities and Colleges with disparate legacy infrastructure, while preventing workflow deadlock and audit tampering.',
      architecture: 'Built a declarative JSON-schema form engine driving a deterministic finite-state machine evaluator in C# ASP.NET Core, decoupled through RabbitMQ queues and Keycloak enterprise authentication.',
      scalability: 'Designed a hybrid cloud architecture combining institutional on-premise nodes with cloud object storage tiers (AWS S3, Azure Blob), ensuring regulatory compliance and offline-tolerant institutional data capture.',
      verifiedOutcome: 'Unified data validation and compliance scoring across higher education institutions nationwide, streamlining annual accreditation and government reporting cycles.',
      techStack: ['C#', 'ASP.NET Core', 'RabbitMQ', 'Keycloak', 'React', 'TypeScript', 'PostgreSQL', 'AWS S3', 'Azure Blob', 'Docker'],
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
    company: 'PointersBit Inc. / T-Digital Inc',
    location: 'Cagayan de Oro City, PH',
    model: 'Hybrid',
    summary: 'Architected full-stack web features and front-end engineering standards across client platforms (including T-Digital Inc and regional enterprise systems), enforcing strict PR review gates, modular component architecture, and agentic AI-assisted development guardrails. Built low-latency React and TypeScript applications with scalable state management and bundle optimizations.',
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
    company: 'BenManage (White Cloak Technologies partner)',
    location: 'Israel',
    model: 'Remote',
    summary: 'Developed and maintained live production enterprise benefits administration platform with White Cloak Technologies and Israeli partner engineering team, shipping new modules with strict backward compatibility across active client deployments. Delivered non-breaking backend API integrations and additive SQL schema migrations.',
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

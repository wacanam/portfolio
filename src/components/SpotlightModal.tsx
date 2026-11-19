import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  ArrowRight,
  Copy,
  Check,
  MessageSquare,
  Phone,
  Download,
  Sun,
  Moon,
  Layers,
  Cpu,
  Briefcase,
  Link2,
  GitBranch,
} from 'lucide-react';
import {
  contactData,
  flagshipSystems,
  skillCategories,
  careerTimeline,
} from '../data/portfolio';
import { FlagshipSystem } from '../types';
import { buildSkillShareUrl } from '../utils/skillMatch';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem: (system: FlagshipSystem) => void;
  onSelectSystemNode?: (system: FlagshipSystem, nodeIdx: number) => void;
  onSelectSkill?: (skill: string) => void;
  onSelectCareer?: (careerId: string) => void;
  selectedSkill?: string | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

type SpotlightCategory =
  | 'Navigation'
  | 'Blueprint'
  | 'Node'
  | 'Skill'
  | 'Experience'
  | 'Action';

interface SpotlightItem {
  id: string;
  category: SpotlightCategory;
  title: string;
  subtitle: string;
  keywords?: string;
  icon: React.ReactNode;
  action: () => void;
}

const CATEGORY_ORDER: SpotlightCategory[] = [
  'Navigation',
  'Blueprint',
  'Node',
  'Skill',
  'Experience',
  'Action',
];

const CATEGORY_LABELS: Record<SpotlightCategory, string> = {
  Navigation: 'Navigation',
  Blueprint: 'Blueprints',
  Node: 'System Pipeline Nodes',
  Skill: 'Skills & Stack',
  Experience: 'Career Chronology',
  Action: 'Quick Actions',
};

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  onSelectSystem,
  onSelectSystemNode,
  onSelectSkill,
  onSelectCareer,
  selectedSkill = null,
  theme,
  onToggleTheme,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedSkillLink, setCopiedSkillLink] = useState(false);

  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        // Global shortcut binding handled by App.tsx
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setQuery('');
        setSelectedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const scrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactData.email);
    } catch {
      const input = document.createElement('input');
      input.value = contactData.email;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const handleCopyActiveSkillLink = async () => {
    if (!selectedSkill) return;
    const url = buildSkillShareUrl(selectedSkill);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopiedSkillLink(true);
    setTimeout(() => {
      setCopiedSkillLink(false);
      onClose();
    }, 1200);
  };

  const curatedItems: SpotlightItem[] = [
    // Navigation items
    {
      id: 'nav-overview',
      category: 'Navigation',
      title: 'Overview & Hero',
      subtitle: 'Overview, metrics, résumé & direct links',
      icon: <ArrowRight className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => scrollTo('hero'),
    },
    {
      id: 'nav-systems',
      category: 'Navigation',
      title: 'Flagship Systems',
      subtitle: 'Broadband Mapping, Clinic EZ & ERP EZ, Institutional ETL',
      icon: <ArrowRight className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => scrollTo('systems'),
    },
    {
      id: 'nav-stack',
      category: 'Navigation',
      title: 'Stack & Architecture Matrix',
      subtitle: '48 engineering competencies across 5 domains',
      icon: <ArrowRight className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => scrollTo('stack'),
    },
    {
      id: 'nav-experience',
      category: 'Navigation',
      title: 'Career Specification Sheet',
      subtitle: '8 chronological verified milestone rows (2015–Present)',
      icon: <ArrowRight className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => scrollTo('experience'),
    },
    {
      id: 'nav-contact',
      category: 'Navigation',
      title: 'Executive Coordinates & Contact',
      subtitle: 'Live PHT overlap, email copy, WhatsApp, Viber, résumé download',
      icon: <ArrowRight className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => scrollTo('contact'),
    },

    // Blueprint modals
    {
      id: 'blueprint-broadband',
      category: 'Blueprint',
      title: 'Blueprint: National Broadband Mapping',
      subtitle: '100M+ spatial points · 42,000+ geometries · PostGIS',
      keywords: flagshipSystems[0].deepArchitecture.techStack.join(' '),
      icon: <Layers className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => {
        onClose();
        setTimeout(() => onSelectSystem(flagshipSystems[0]), 100);
      },
    },
    {
      id: 'blueprint-clinic',
      category: 'Blueprint',
      title: 'Blueprint: Clinic EZ & ERP EZ Suite',
      subtitle: '20,000+ users · 100–300 DAUs · E2EE & pgvector',
      keywords: flagshipSystems[1].deepArchitecture.techStack.join(' '),
      icon: <Layers className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => {
        onClose();
        setTimeout(() => onSelectSystem(flagshipSystems[1]), 100);
      },
    },
    {
      id: 'blueprint-edcs',
      category: 'Blueprint',
      title: 'Blueprint: Institutional ETL & Validation',
      subtitle: 'RabbitMQ workers · Schema validation · Nationwide SUCs/HEIs',
      keywords: flagshipSystems[2].deepArchitecture.techStack.join(' '),
      icon: <Layers className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => {
        onClose();
        setTimeout(() => onSelectSystem(flagshipSystems[2]), 100);
      },
    },

    // Quick Actions
    ...(selectedSkill
      ? [
          {
            id: 'act-copy-skill-link',
            category: 'Action' as const,
            title: copiedSkillLink
              ? 'Skill Filter Link Copied ✓'
              : `Copy Shareable Filter Link (?skill=${selectedSkill})`,
            subtitle: 'Share URL pre-filtered to highlighted systems & career roles',
            icon: copiedSkillLink ? (
              <Check className="w-4 h-4 text-[var(--accent-signal)]" />
            ) : (
              <Link2 className="w-4 h-4 text-[var(--accent-titanium)]" />
            ),
            action: handleCopyActiveSkillLink,
          },
        ]
      : []),
    {
      id: 'act-copy-email',
      category: 'Action',
      title: copied ? 'Email Copied to Clipboard ✓' : 'Copy Direct Email',
      subtitle: contactData.email,
      icon: copied ? (
        <Check className="w-4 h-4 text-[var(--accent-signal)]" />
      ) : (
        <Copy className="w-4 h-4 text-[var(--accent-titanium)]" />
      ),
      action: handleCopyEmail,
    },
    {
      id: 'act-whatsapp',
      category: 'Action',
      title: 'Launch WhatsApp Direct',
      subtitle: '+63 965 429 7640',
      icon: <MessageSquare className="w-4 h-4 text-[var(--accent-signal)]" />,
      action: () => {
        window.open(contactData.whatsappUrl, '_blank');
        onClose();
      },
    },
    {
      id: 'act-viber',
      category: 'Action',
      title: 'Launch Viber Direct',
      subtitle: '+63 965 429 7640',
      icon: <Phone className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => {
        window.open(contactData.viberUrl, '_blank');
        onClose();
      },
    },
    {
      id: 'act-download-resume',
      category: 'Action',
      title: 'Download Verified Résumé (PDF)',
      subtitle: '2-page comprehensive technical resume',
      icon: <Download className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => {
        const link = document.createElement('a');
        link.href = contactData.resumeUrl;
        link.download = 'Wave_Ambray_Resume.pdf';
        link.click();
        onClose();
      },
    },
    {
      id: 'act-toggle-theme',
      category: 'Action',
      title: `Switch to ${theme === 'dark' ? 'Silver Alabaster (Light)' : 'Obsidian (Dark)'} Mode`,
      subtitle: 'Persisted across sessions with zero theme flash',
      icon:
        theme === 'dark' ? (
          <Sun className="w-4 h-4 text-[var(--accent-titanium)]" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--accent-titanium)]" />
        ),
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
  ];

  // Build deep search entries for Skills, 15 Pipeline Nodes, and 8 Career Chronology Rows
  const deepIndexItems = useMemo<SpotlightItem[]>(() => {
    const nodeItems: SpotlightItem[] = flagshipSystems.flatMap((system) =>
      system.nodes.map((node, nodeIdx) => ({
        id: `node-${system.id}-${node.id}`,
        category: 'Node' as const,
        title: `${node.name.replace(/^Node \d+:\s*/, '')} — ${system.title.split('&')[0].trim()}`,
        subtitle: `${node.tech} · ${node.guarantee}`,
        keywords: `${node.name} ${node.role} ${node.details} ${system.title} ${system.scaleProof}`,
        icon: <GitBranch className="w-4 h-4 text-[var(--accent-titanium)]" />,
        action: () => {
          onClose();
          setTimeout(() => {
            if (onSelectSystemNode) {
              onSelectSystemNode(system, nodeIdx);
            } else {
              onSelectSystem(system);
            }
          }, 90);
        },
      }))
    );

    const domainCategories = skillCategories.filter((c) => c.id !== 'all');
    const allSkills = skillCategories.find((c) => c.id === 'all')?.skills ?? [];
    const skillItems: SpotlightItem[] = allSkills.map((skill) => {
      const domain = domainCategories.find((cat) => cat.skills.includes(skill));
      return {
        id: `skill-${skill}`,
        category: 'Skill' as const,
        title: skill,
        subtitle: `${domain?.name ?? 'Core Competency'} · Filter career roles & matching systems`,
        keywords: `${skill} ${domain?.name ?? ''}`,
        icon: <Cpu className="w-4 h-4 text-[var(--accent-titanium)]" />,
        action: () => {
          onClose();
          setTimeout(() => {
            onSelectSkill?.(skill);
          }, 90);
        },
      };
    });

    const careerItems: SpotlightItem[] = careerTimeline.map((row) => ({
      id: `exp-${row.id}`,
      category: 'Experience' as const,
      title: `${row.role} · ${row.company}`,
      subtitle: `${row.period} · ${row.location} (${row.model})`,
      keywords: `${row.summary} ${row.technologies.join(' ')}`,
      icon: <Briefcase className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => {
        onClose();
        setTimeout(() => {
          onSelectCareer?.(row.id);
        }, 90);
      },
    }));

    return [...nodeItems, ...skillItems, ...careerItems];
  }, [onClose, onSelectSystem, onSelectSystemNode, onSelectSkill, onSelectCareer]);

  const trimmedQuery = query.trim().toLowerCase();
  const searchPool = trimmedQuery === '' ? curatedItems : [...curatedItems, ...deepIndexItems];

  const filteredItems =
    trimmedQuery === ''
      ? searchPool
      : searchPool.filter(
          (item) =>
            item.title.toLowerCase().includes(trimmedQuery) ||
            item.subtitle.toLowerCase().includes(trimmedQuery) ||
            item.category.toLowerCase().includes(trimmedQuery) ||
            (item.keywords?.toLowerCase().includes(trimmedQuery) ?? false)
        );

  const groupedItems = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: filteredItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  // Flatten groups in visual top-to-bottom order so arrow keys strictly match screen order
  const orderedItems = groupedItems.flatMap((g) => g.items);
  const safeSelectedIndex =
    orderedItems.length === 0 ? 0 : Math.min(selectedIndex, orderedItems.length - 1);

  useEffect(() => {
    if (!isOpen) return;
    rowRefs.current[safeSelectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [safeSelectedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (orderedItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % orderedItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (orderedItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + orderedItems.length) % orderedItems.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (orderedItems[safeSelectedIndex]) {
        orderedItems[safeSelectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Modern Web Guidance light-dismiss fallback
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

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...({ closedby: 'any' } as Record<string, unknown>)}
      className="my-auto sm:mt-[12vh] sm:mb-auto mx-auto w-[92vw] max-w-[620px] rounded-[22px] p-0 glass-sheet focus:outline-none overflow-hidden text-[var(--text-primary)]"
    >
      <div className="flex flex-col max-h-[78vh] overflow-hidden">
        {/* Search Input Bar — Apple Spotlight display proportions */}
        <div className="flex items-center gap-3.5 px-6 py-4 sm:py-5 border-b border-[var(--border-hairline)]">
          <Search className="w-[18px] h-[18px] text-[var(--text-tertiary)] shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search sections, blueprints, 48+ skills, roles, or actions..."
            className="w-full bg-transparent border-none text-base sm:text-[19px] font-normal tracking-[-0.02em] leading-snug text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
            aria-label="Spotlight search input"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-md border border-[var(--border-hairline)] transition-colors"
            aria-label="Close Spotlight search"
          >
            ESC
          </button>
        </div>

        {/* Grouped Typographic Results */}
        <div className="px-3 pb-3 pt-1 overflow-y-auto overscroll-contain">
          {orderedItems.length === 0 ? (
            <div className="py-14 text-center text-sm tracking-[-0.01em] text-[var(--text-secondary)]">
              No matching sections, blueprints, skills, roles, or actions.
            </div>
          ) : (
            (() => {
              let runningIdx = 0;
              return groupedItems.map((group) => (
                <div key={group.category} className="mb-1 last:mb-0">
                  <div className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--text-tertiary)] select-none">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const idx = runningIdx++;
                      const isSelected = safeSelectedIndex === idx;
                      return (
                        <button
                          key={item.id}
                          ref={(el) => {
                            rowRefs.current[idx] = el;
                          }}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                            isSelected
                              ? 'bg-[var(--surface-card-strong)] text-[var(--text-primary)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--surface-card)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`shrink-0 transition-opacity ${
                                isSelected ? 'opacity-100' : 'opacity-70'
                              }`}
                            >
                              {item.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="text-[13.5px] sm:text-sm font-medium tracking-[-0.015em] text-[var(--text-primary)] truncate">
                                {item.title}
                              </div>
                              <div className="text-xs tracking-[-0.005em] text-[var(--text-secondary)] truncate mt-0.5">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <span
                            aria-hidden="true"
                            className={`text-[11px] font-mono text-[var(--accent-titanium)] shrink-0 transition-opacity ${
                              isSelected ? 'opacity-100' : 'opacity-0'
                            }`}
                          >
                            ↵
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()
          )}
        </div>

        {/* Minimal Hairline Footer */}
        <div className="px-6 py-2.5 border-t border-[var(--border-hairline)] flex items-center justify-between text-[10.5px] font-mono tracking-wide text-[var(--text-tertiary)]">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            {trimmedQuery === '' && <span className="hidden sm:inline">Type to search 48 skills, 15 nodes &amp; 8 roles</span>}
          </div>
          <span>{orderedItems.length} {orderedItems.length === 1 ? 'result' : 'results'}</span>
        </div>
      </div>
    </dialog>
  );
};

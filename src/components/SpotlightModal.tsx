import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Copy, Check, MessageSquare, Phone, Download, Sun, Moon, Layers } from 'lucide-react';
import { contactData, flagshipSystems } from '../data/portfolio';
import { FlagshipSystem } from '../types';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem: (system: FlagshipSystem) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

interface SpotlightItem {
  id: string;
  category: 'Navigation' | 'Blueprint' | 'Action';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  onSelectSystem,
  theme,
  onToggleTheme,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        // Global shortcut binding check
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

  const allItems: SpotlightItem[] = [
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
      subtitle: '30+ engineering competencies across 5 domains',
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
      subtitle: 'Email copy, WhatsApp, Viber, résumé download',
      icon: <ArrowRight className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => scrollTo('contact'),
    },

    // Blueprint modals
    {
      id: 'blueprint-broadband',
      category: 'Blueprint',
      title: 'Blueprint: National Broadband Mapping',
      subtitle: '100M+ spatial points · 42,000+ geometries · PostGIS',
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
      icon: <Layers className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => {
        onClose();
        setTimeout(() => onSelectSystem(flagshipSystems[2]), 100);
      },
    },

    // Actions
    {
      id: 'act-copy-email',
      category: 'Action',
      title: copied ? 'Email Copied to Clipboard ✓' : 'Copy Direct Email',
      subtitle: contactData.email,
      icon: copied ? <Check className="w-4 h-4 text-[var(--accent-signal)]" /> : <Copy className="w-4 h-4 text-[var(--accent-titanium)]" />,
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
      subtitle: '3-page comprehensive technical resume',
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
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--accent-titanium)]" /> : <Moon className="w-4 h-4 text-[var(--accent-titanium)]" />,
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
  ];

  const filteredItems = query.trim() === ''
    ? allItems
    : allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
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
      className="m-auto w-[92vw] max-w-xl rounded-3xl p-0 glass-sheet shadow-2xl focus:outline-none overflow-hidden text-[var(--text-primary)]"
    >
      <div className="flex flex-col max-h-[80vh] overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-hairline)] bg-[var(--surface-card)]">
          <Search className="w-5 h-5 text-[var(--accent-titanium)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search chapters, blueprints, or actions..."
            className="w-full bg-transparent border-none text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none"
            aria-label="Spotlight search input"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-card-strong)] rounded border border-[var(--border-subtle)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto overscroll-contain space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-secondary)] font-mono">
              No matching commands or chapters found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-[var(--surface-card-strong)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-card)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-hairline)] shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] shrink-0 px-2 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-hairline)]">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-5 py-2.5 border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-card)]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Wave Cantery Ambray Portfolio</span>
        </div>
      </div>
    </dialog>
  );
};

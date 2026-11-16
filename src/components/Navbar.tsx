import React, { useState, useEffect } from 'react';
import { Sun, Moon, Search, Layers, Briefcase, Cpu, Mail, Home } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSpotlight: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme, onOpenSpotlight }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform));

    const handleScroll = () => {
      const sections = ['hero', 'systems', 'stack', 'experience', 'contact'];
      const scrollY = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop Top Dock */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 hidden md:block">
        <nav
          className="glass-dock rounded-full px-5 py-2 flex items-center gap-7 shadow-2xl transition-all duration-300"
          aria-label="Desktop primary navigation"
        >
          <button
            onClick={() => scrollTo('hero')}
            className={`text-xs font-medium tracking-wide transition-colors ${
              activeSection === 'hero' ? 'text-[var(--accent-titanium)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => scrollTo('systems')}
            className={`text-xs font-medium tracking-wide transition-colors ${
              activeSection === 'systems' ? 'text-[var(--accent-titanium)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Systems
          </button>
          <button
            onClick={() => scrollTo('stack')}
            className={`text-xs font-medium tracking-wide transition-colors ${
              activeSection === 'stack' ? 'text-[var(--accent-titanium)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Stack
          </button>
          <button
            onClick={() => scrollTo('experience')}
            className={`text-xs font-medium tracking-wide transition-colors ${
              activeSection === 'experience' ? 'text-[var(--accent-titanium)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Experience
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className={`text-xs font-medium tracking-wide transition-colors ${
              activeSection === 'contact' ? 'text-[var(--accent-titanium)] font-semibold' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Contact
          </button>

          <div className="h-3.5 w-px bg-[var(--border-subtle)]" />

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-titanium)]"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Spotlight trigger */}
          <button
            onClick={onOpenSpotlight}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--border-hairline)] hover:bg-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-hairline)]"
            title="Open Spotlight Search"
          >
            <Search className="w-3 h-3 text-[var(--accent-titanium)]" />
            <span className="font-mono text-[10px] tracking-wider">{isMac ? '⌘K' : 'Ctrl+K'}</span>
          </button>
        </nav>
      </header>

      {/* Mobile Bottom Dock */}
      <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden w-[92%] max-w-sm">
        <nav
          className="glass-dock rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl"
          aria-label="Mobile navigation bar"
        >
          <button
            onClick={() => scrollTo('hero')}
            className={`p-2 rounded-full transition-colors ${
              activeSection === 'hero' ? 'text-[var(--accent-titanium)] bg-[var(--border-hairline)]' : 'text-[var(--text-secondary)]'
            }`}
            aria-label="Overview"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTo('systems')}
            className={`p-2 rounded-full transition-colors ${
              activeSection === 'systems' ? 'text-[var(--accent-titanium)] bg-[var(--border-hairline)]' : 'text-[var(--text-secondary)]'
            }`}
            aria-label="Systems"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTo('stack')}
            className={`p-2 rounded-full transition-colors ${
              activeSection === 'stack' ? 'text-[var(--accent-titanium)] bg-[var(--border-hairline)]' : 'text-[var(--text-secondary)]'
            }`}
            aria-label="Tech Stack"
          >
            <Cpu className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTo('experience')}
            className={`p-2 rounded-full transition-colors ${
              activeSection === 'experience' ? 'text-[var(--accent-titanium)] bg-[var(--border-hairline)]' : 'text-[var(--text-secondary)]'
            }`}
            aria-label="Experience"
          >
            <Briefcase className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className={`p-2 rounded-full transition-colors ${
              activeSection === 'contact' ? 'text-[var(--accent-titanium)] bg-[var(--border-hairline)]' : 'text-[var(--text-secondary)]'
            }`}
            aria-label="Contact"
          >
            <Mail className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[var(--border-subtle)]" />

          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenSpotlight}
            aria-label="Open Spotlight Search"
            className="p-2 rounded-full text-[var(--accent-titanium)] bg-[var(--border-hairline)]"
          >
            <Search className="w-4 h-4" />
          </button>
        </nav>
      </footer>
    </>
  );
};

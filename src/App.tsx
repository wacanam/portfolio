import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ParticleField } from './components/ParticleField';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SystemSection } from './components/SystemSection';
import { ArchitectureSheet } from './components/ArchitectureSheet';
import { ExperienceSpec } from './components/ExperienceSpec';
import { ContactCard } from './components/ContactCard';
import { SpotlightModal } from './components/SpotlightModal';
import { flagshipSystems, skillCategories } from './data/portfolio';
import { FlagshipSystem } from './types';
import { resolveCanonicalSkill } from './utils/skillMatch';

const ALL_SKILLS = skillCategories.find((c) => c.id === 'all')?.skills ?? [];

function resolveSystemFromHash(): FlagshipSystem | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.startsWith('#blueprint-')) return null;
  const targetId = hash.slice('#blueprint-'.length);
  return flagshipSystems.find((sys) => sys.id === targetId) ?? null;
}

function resolveSkillFromSearch(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return resolveCanonicalSkill(params.get('skill'), ALL_SKILLS);
}

export const App: React.FC = () => {
  // Theme state persisted in localStorage with zero-CLS initial hydration
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wave-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'dark';
  });

  const [architectureSystem, setArchitectureSystem] = useState<FlagshipSystem | null>(() =>
    resolveSystemFromHash()
  );
  const [architectureNodeIdx, setArchitectureNodeIdx] = useState<number>(0);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(() =>
    resolveSkillFromSearch()
  );
  const [highlightedCareerId, setHighlightedCareerId] = useState<string | null>(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  const savedScrollYRef = useRef(0);
  const careerHighlightTimerRef = useRef<number | null>(null);
  const activeSystemRef = useRef<FlagshipSystem | null>(architectureSystem);
  activeSystemRef.current = architectureSystem;

  // Synchronize data-theme on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wave-theme', theme);
  }, [theme]);

  // Synchronize selectedSkill to ?skill= URL query parameter without clobbering hashes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const currentParam = url.searchParams.get('skill');
    if (selectedSkill) {
      if (currentParam !== selectedSkill) {
        url.searchParams.set('skill', selectedSkill);
        window.history.replaceState(window.history.state, '', url.toString());
      }
    } else if (currentParam !== null) {
      url.searchParams.delete('skill');
      window.history.replaceState(window.history.state, '', url.toString());
    }
  }, [selectedSkill]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Support browser back/forward navigation between root overview, URL ?skill= state, and blueprints
  useEffect(() => {
    const handlePopState = () => {
      const nextSystem = resolveSystemFromHash();
      const wasOpen = Boolean(activeSystemRef.current);
      setArchitectureSystem(nextSystem);
      setArchitectureNodeIdx(0);
      setSelectedSkill(resolveSkillFromSearch());
      if (wasOpen && !nextSystem) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScrollYRef.current);
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    return () => {
      if (careerHighlightTimerRef.current !== null) {
        window.clearTimeout(careerHighlightTimerRef.current);
      }
    };
  }, []);

  const handleOpenSystem = useCallback((system: FlagshipSystem, nodeIdx = 0) => {
    if (!activeSystemRef.current) {
      savedScrollYRef.current = window.scrollY;
    }
    setArchitectureNodeIdx(nodeIdx);
    setArchitectureSystem(system);
    const url = new URL(window.location.href);
    url.hash = `#blueprint-${system.id}`;
    if (window.location.hash !== url.hash) {
      window.history.pushState({ systemId: system.id }, '', url.toString());
    }
  }, []);

  const handleCloseSystem = useCallback(() => {
    setArchitectureSystem(null);
    setArchitectureNodeIdx(0);
    if (window.location.hash.startsWith('#blueprint-')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScrollYRef.current);
    });
  }, []);

  const handleSelectSkillAndScroll = useCallback((skill: string) => {
    const canonical = resolveCanonicalSkill(skill, ALL_SKILLS);
    setSelectedSkill(canonical);
    if (activeSystemRef.current) {
      setArchitectureSystem(null);
      setArchitectureNodeIdx(0);
      if (window.location.hash.startsWith('#blueprint-')) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById('stack')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    });
  }, []);

  const handleSelectCareer = useCallback((careerId: string) => {
    if (activeSystemRef.current) {
      setArchitectureSystem(null);
      setArchitectureNodeIdx(0);
      if (window.location.hash.startsWith('#blueprint-')) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }
    setHighlightedCareerId(careerId);
    if (careerHighlightTimerRef.current !== null) {
      window.clearTimeout(careerHighlightTimerRef.current);
    }
    careerHighlightTimerRef.current = window.setTimeout(() => {
      setHighlightedCareerId(null);
    }, 3400);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        const target =
          document.getElementById(isMobile ? `mobile-${careerId}` : careerId) ??
          document.getElementById('experience');
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    });
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-[var(--accent-titanium)]/20 selection:text-[var(--accent-titanium)]">
      {/* Subtly animated ordered pattern grid with cursor repulsion & ripple physics across all views */}
      <ParticleField theme={theme} isModalOpen={isSpotlightOpen} />

      {architectureSystem ? (
        <ArchitectureSheet
          system={architectureSystem}
          initialNodeIdx={architectureNodeIdx}
          onSelectSystem={(sys) => handleOpenSystem(sys, 0)}
          onClose={handleCloseSystem}
        />
      ) : (
        <>
          {/* Navigation Docks (Desktop top dock & mobile bottom dock) */}
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenSpotlight={() => setIsSpotlightOpen(true)}
          />

          {/* Main Content Flow */}
          <main className="relative z-10">
            <Hero
              selectedSkill={selectedSkill}
              onSelectSkill={handleSelectSkillAndScroll}
            />

            <SystemSection
              onOpenArchitectureSheet={(sys) => handleOpenSystem(sys, 0)}
              selectedSkill={selectedSkill}
              onSelectSkill={setSelectedSkill}
            />

            <ExperienceSpec
              selectedSkill={selectedSkill}
              onSelectSkill={setSelectedSkill}
              highlightedCareerId={highlightedCareerId}
            />

            <ContactCard />
          </main>

          {/* Footer */}
          <footer className="relative z-10 py-12 px-6 text-center text-xs text-[var(--text-tertiary)] font-mono border-t border-[var(--border-hairline)] select-none">
            <p>Wave Cantery Ambray · Full-Stack Software Engineer</p>
            <p className="mt-1 opacity-70">
              Engineered with generous negative space &amp; zero heavy 3D dependencies.
            </p>
          </footer>
        </>
      )}

      {/* Spotlight Command Palette (⌘K) */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSelectSystem={(sys) => handleOpenSystem(sys, 0)}
        onSelectSystemNode={handleOpenSystem}
        onSelectSkill={handleSelectSkillAndScroll}
        onSelectCareer={handleSelectCareer}
        selectedSkill={selectedSkill}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
};

export default App;

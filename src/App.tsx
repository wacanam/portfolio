import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ParticleField } from './components/ParticleField';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SystemSection } from './components/SystemSection';
import { ArchitectureSheet } from './components/ArchitectureSheet';
import { ExperienceSpec } from './components/ExperienceSpec';
import { ContactCard } from './components/ContactCard';
import { SpotlightModal } from './components/SpotlightModal';
import { flagshipSystems } from './data/portfolio';
import { FlagshipSystem } from './types';

function resolveSystemFromHash(): FlagshipSystem | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.startsWith('#blueprint-')) return null;
  const targetId = hash.slice('#blueprint-'.length);
  return flagshipSystems.find((sys) => sys.id === targetId) ?? null;
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
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  const savedScrollYRef = useRef(0);
  const activeSystemRef = useRef<FlagshipSystem | null>(architectureSystem);
  activeSystemRef.current = architectureSystem;

  // Synchronize data-theme on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wave-theme', theme);
  }, [theme]);

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

  // Support browser back/forward navigation between root overview and full-page blueprints
  useEffect(() => {
    const handlePopState = () => {
      const nextSystem = resolveSystemFromHash();
      const wasOpen = Boolean(activeSystemRef.current);
      setArchitectureSystem(nextSystem);
      if (wasOpen && !nextSystem) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScrollYRef.current);
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenSystem = useCallback((system: FlagshipSystem) => {
    if (!activeSystemRef.current) {
      savedScrollYRef.current = window.scrollY;
    }
    setArchitectureSystem(system);
    const targetHash = `#blueprint-${system.id}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState({ systemId: system.id }, '', targetHash);
    }
  }, []);

  const handleCloseSystem = useCallback(() => {
    setArchitectureSystem(null);
    if (window.location.hash.startsWith('#blueprint-')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    requestAnimationFrame(() => {
      window.scrollTo(0, savedScrollYRef.current);
    });
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-[var(--accent-titanium)]/20 selection:text-[var(--accent-titanium)]">
      {/* Subtly animated ordered pattern grid with cursor repulsion & ripple physics across all views */}
      <ParticleField theme={theme} isModalOpen={isSpotlightOpen} />

      {architectureSystem ? (
        <ArchitectureSheet
          system={architectureSystem}
          onSelectSystem={handleOpenSystem}
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
            <Hero />

            <SystemSection onOpenArchitectureSheet={handleOpenSystem} />

            <ExperienceSpec />

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
        onSelectSystem={handleOpenSystem}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { ParticleField } from './components/ParticleField';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SystemSection } from './components/SystemSection';
import { ArchitectureSheet } from './components/ArchitectureSheet';
import { ExperienceSpec } from './components/ExperienceSpec';
import { ContactCard } from './components/ContactCard';
import { SpotlightModal } from './components/SpotlightModal';
import { FlagshipSystem } from './types';

export const App: React.FC = () => {
  // Theme state persisted in localStorage with zero-CLS initial hydration
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wave-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'dark';
  });

  const [architectureSystem, setArchitectureSystem] = useState<FlagshipSystem | null>(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

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

  const isModalOpen = Boolean(architectureSystem || isSpotlightOpen);

  return (
    <div className="relative min-h-screen selection:bg-[var(--accent-titanium)]/20 selection:text-[var(--accent-titanium)]">
      {/* Precision Blueprint Grid & Interactive Cursor Wake */}
      <ParticleField theme={theme} isModalOpen={isModalOpen} />

      {/* Navigation Docks (Desktop top dock & mobile bottom dock) */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
      />

      {/* Main Content Flow */}
      <main className="relative z-10">
        <Hero />

        <SystemSection
          onOpenArchitectureSheet={(system) => setArchitectureSystem(system)}
        />

        <ExperienceSpec />

        <ContactCard />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 text-center text-xs text-[var(--text-tertiary)] font-mono border-t border-[var(--border-hairline)] select-none">
        <p>
          Wave C. Ambray · Full-Stack Software Engineer
        </p>
        <p className="mt-1 opacity-70">
          Engineered with generous negative space &amp; zero heavy 3D dependencies.
        </p>
      </footer>

      {/* Architecture Sheet Modal (<dialog> kept mounted cleanly) */}
      <ArchitectureSheet
        system={architectureSystem}
        onClose={() => setArchitectureSystem(null)}
      />

      {/* Spotlight Command Palette (⌘K) */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onSelectSystem={(sys) => setArchitectureSystem(sys)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
};

export default App;

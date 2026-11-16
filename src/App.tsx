import React, { useState, useEffect, useRef } from 'react';
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

  const [activeFormation, setActiveFormation] = useState<0 | 1 | 2 | 3>(0);
  const [architectureSystem, setArchitectureSystem] = useState<FlagshipSystem | null>(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Manual formation preview lock to prevent IntersectionObserver from clobbering Hero clicks
  const isManualPreviewRef = useRef(false);

  const handleSelectFormation = (idx: 0 | 1 | 2 | 3) => {
    isManualPreviewRef.current = idx !== 0;
    setActiveFormation(idx);
  };

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

  // IntersectionObserver to sync 3D particle formations with scroll chapters
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id === 'hero') {
            if (!isManualPreviewRef.current) {
              setActiveFormation(0); // Fibonacci sphere
            }
          } else if (id === 'heading-system-broadband') {
            isManualPreviewRef.current = false;
            setActiveFormation(1); // Topographic wave
          } else if (id === 'heading-system-clinic-erp') {
            isManualPreviewRef.current = false;
            setActiveFormation(2); // Dual-ring cipher torus
          } else if (id === 'heading-system-edcs') {
            isManualPreviewRef.current = false;
            setActiveFormation(3); // Crystalline state lattice
          }
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0.1,
    });

    const targets = [
      document.getElementById('hero'),
      document.getElementById('heading-system-broadband'),
      document.getElementById('heading-system-clinic-erp'),
      document.getElementById('heading-system-edcs'),
    ].filter(Boolean) as HTMLElement[];

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-[var(--accent-titanium)]/20 selection:text-[var(--accent-titanium)]">
      {/* 3D Micro-Particle Canvas Engine */}
      <ParticleField activeFormation={activeFormation} theme={theme} />

      {/* Navigation Docks (Desktop top dock & mobile bottom dock) */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
      />

      {/* Main Content Flow */}
      <main className="relative z-10">
        <Hero
          activeFormation={activeFormation}
          onSelectFormation={handleSelectFormation}
        />

        <SystemSection
          onOpenArchitectureSheet={(system) => setArchitectureSystem(system)}
        />

        <ExperienceSpec />

        <ContactCard />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 text-center text-xs text-[var(--text-tertiary)] font-mono border-t border-[var(--border-hairline)] select-none">
        <p>
          Wave C. Ambray · Senior Full-Stack Software Engineer
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

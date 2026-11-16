import React, { useState } from 'react';
import { Layers, X, Briefcase, GraduationCap, Calendar } from 'lucide-react';
import { skillCategories, careerTimeline } from '../data/portfolio';

interface ExperienceSpecProps {
  selectedSkill?: string | null;
  onSelectSkill?: (skill: string | null) => void;
}

export const ExperienceSpec: React.FC<ExperienceSpecProps> = ({
  selectedSkill: externalSkill,
  onSelectSkill: externalOnSelect,
}) => {
  const [internalSkill, setInternalSkill] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const selectedSkill = externalSkill !== undefined ? externalSkill : internalSkill;
  const onSelectSkill = externalOnSelect || setInternalSkill;

  const currentCategory = skillCategories.find((c) => c.id === activeTab) || skillCategories[0];

  return (
    <section id="experience" className="relative py-24 px-6 max-w-6xl mx-auto select-none">
      {/* Scroll anchor preserving Navbar and Spotlight #stack destination */}
      <div id="stack" className="scroll-mt-28" />

      {/* Chapter Eyebrow & Header */}
      <div className="flex flex-col items-start gap-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dock border border-[var(--border-hairline)]">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--accent-titanium)] font-semibold">
            CHAPTER 05
          </span>
          <span className="text-xs text-[var(--border-subtle)]">·</span>
          <span className="text-[10px] font-mono tracking-wider text-[var(--text-secondary)]">
            TECHNICAL SPECIFICATION &amp; CHRONOLOGY
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-metallic">
          Architecture &amp; Career Specification
        </h2>

        {/* Subtitle with verified Radical Word Economy (12 words <= 16 words) */}
        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Six years shipping resilient distributed architectures across US, Israeli, and national platforms.
        </p>
      </div>

      {/* 5 Stack Matrix Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {skillCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-mono tracking-wide transition-all ${
              activeTab === cat.id
                ? 'bg-[var(--accent-titanium)] text-[#050507] font-semibold shadow-md'
                : 'glass-dock text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            {cat.name}
          </button>
        ))}

        {selectedSkill && (
          <button
            onClick={() => onSelectSkill(null)}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-[var(--accent-titanium)] bg-[var(--border-hairline)] border border-[var(--border-subtle)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <span>Highlighted: {selectedSkill}</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Skill Pills Matrix */}
      <div className="rounded-3xl glass-dock p-6 sm:p-7 border border-[var(--border-hairline)] shadow-xl mb-12">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border-hairline)]">
          <Layers className="w-4 h-4 text-[var(--accent-titanium)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-semibold">
            {currentCategory.name} · Click skill to highlight matching career roles
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentCategory.skills.map((skill) => {
            const isSelected = selectedSkill === skill;
            return (
              <button
                key={skill}
                onClick={() => onSelectSkill(isSelected ? null : skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[var(--accent-titanium)] text-[#050507] font-semibold border-[var(--accent-titanium)] shadow-md scale-105'
                    : 'bg-[var(--border-hairline)] text-[var(--text-primary)] border-[var(--border-hairline)] hover:border-[var(--border-subtle)] hover:bg-[var(--border-subtle)]'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Apple Spec-Table Career Timeline (8 Rows with 1px Hairlines) */}
      <div
        className="career-table-container rounded-3xl glass-dock p-6 sm:p-8 border border-[var(--border-hairline)] shadow-xl overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-titanium)]"
        tabIndex={0}
        role="region"
        aria-label="Career Chronology Specification Table"
      >
        {/* Desktop Table View */}
        <table className="w-full text-left border-collapse text-sm hidden md:table">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-xs font-mono uppercase tracking-wider text-[var(--accent-titanium)]">
              <th className="py-4 pr-6 font-semibold w-36">Period</th>
              <th className="py-4 px-6 font-semibold w-64">Role &amp; Company</th>
              <th className="py-4 px-6 font-semibold">Architectural Impact &amp; Technologies</th>
              <th className="py-4 pl-6 font-semibold w-44 text-right">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {careerTimeline.map((row) => {
              const isMatch = selectedSkill
                ? row.technologies.some((t) => t.toLowerCase() === selectedSkill.toLowerCase())
                : false;

              return (
                <tr
                  key={row.id}
                  className={`transition-all duration-300 ${
                    isMatch
                      ? 'bg-[var(--border-subtle)] shadow-inner ring-1 ring-[var(--accent-titanium)]'
                      : 'hover:bg-[var(--border-hairline)]'
                  }`}
                >
                  <td className="py-5 pr-6 font-mono-numbers text-xs text-[var(--text-secondary)] align-top whitespace-nowrap">
                    {row.period}
                  </td>
                  <td className="py-5 px-6 align-top">
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                      {row.isEducation ? (
                        <GraduationCap className="w-4 h-4 text-[var(--accent-titanium)] shrink-0" />
                      ) : (
                        <Briefcase className="w-4 h-4 text-[var(--accent-titanium)] shrink-0" />
                      )}
                      <span>{row.role}</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                      {row.company}
                    </div>
                  </td>
                  <td className="py-5 px-6 align-top">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                      {row.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {row.technologies.map((tech) => {
                        const isTechMatch =
                          selectedSkill?.toLowerCase() === tech.toLowerCase();
                        return (
                          <span
                            key={tech}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              isTechMatch
                                ? 'bg-[var(--accent-titanium)] text-[#050507] font-semibold border-[var(--accent-titanium)]'
                                : 'bg-[var(--border-hairline)] text-[var(--text-tertiary)] border-[var(--border-hairline)]'
                            }`}
                          >
                            {tech}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-5 pl-6 align-top text-right font-mono text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    <div>{row.location}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{row.model}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile Stacked Spec Cards */}
        <div className="space-y-4 md:hidden">
          {careerTimeline.map((row) => {
            const isMatch = selectedSkill
              ? row.technologies.some((t) => t.toLowerCase() === selectedSkill.toLowerCase())
              : false;

            return (
              <div
                key={row.id}
                className={`p-5 rounded-2xl border transition-all duration-300 ${
                  isMatch
                    ? 'bg-[var(--border-subtle)] border-[var(--accent-titanium)] ring-1 ring-[var(--accent-titanium)]'
                    : 'bg-[var(--border-hairline)] border-[var(--border-hairline)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent-titanium)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{row.period}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                    {row.model}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {row.role}
                </h3>
                <div className="text-xs text-[var(--text-secondary)] mb-3">
                  {row.company} · {row.location}
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  {row.summary}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {row.technologies.map((tech) => {
                    const isTechMatch =
                      selectedSkill?.toLowerCase() === tech.toLowerCase();
                    return (
                      <span
                        key={tech}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          isTechMatch
                            ? 'bg-[var(--accent-titanium)] text-[#050507] font-semibold border-[var(--accent-titanium)]'
                            : 'bg-[var(--border-hairline)] text-[var(--text-tertiary)] border-[var(--border-hairline)]'
                        }`}
                      >
                        {tech}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

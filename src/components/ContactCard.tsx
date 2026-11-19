import React, { useState, useEffect } from 'react';
import {
  Mail,
  Copy,
  Check,
  MessageSquare,
  Phone,
  Download,
  Github,
  Linkedin,
  MapPin,
  Globe,
  Clock,
} from 'lucide-react';
import { contactData } from '../data/portfolio';
import { profileMeta } from '../generated/assetMeta';
import { getTimezoneSnapshot, TimezoneSnapshot } from '../utils/timezone';

export const ContactCard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [tzSnapshot, setTzSnapshot] = useState<TimezoneSnapshot>(() => getTimezoneSnapshot());

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'hidden') {
        setTzSnapshot(getTimezoneSnapshot());
      }
    };

    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactData.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = contactData.email;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  return (
    <section id="contact" className="relative py-28 px-6 max-w-5xl mx-auto select-none">
      <div className="flex flex-col items-center text-center gap-3 mb-14">
        <div className="inline-flex items-center gap-3">
          <span className="w-6 h-px bg-[var(--accent-titanium)]" aria-hidden="true" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-[var(--accent-titanium)] font-semibold">
            CHAPTER 06
          </span>
          <span className="text-xs text-[var(--border-subtle)]">·</span>
          <span className="text-[11px] font-mono tracking-wider text-[var(--text-secondary)]">
            EXECUTIVE COORDINATES
          </span>
          <span className="w-6 h-px bg-[var(--accent-titanium)]" aria-hidden="true" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-metallic">
          Initiate Direct Collaboration
        </h2>

        {/* Subtitle with verified Radical Word Economy (10 words <= 16 words) */}
        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl leading-relaxed">
          {'Direct executive channels for remote full-stack and backend architecture roles.'}
        </p>
      </div>

      <div className="rounded-3xl glass-dock p-8 sm:p-12 border border-[var(--border-hairline)] shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Portrait Column — seamless radial fade in Dark Mode, clean borderless medallion in Light Mode */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-48 sm:w-56 aspect-square portrait-blend group">
              <div className="relative w-full h-full overflow-hidden portrait-blend-inner">
                {/* Blur-up placeholder background Data URI */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-md scale-105"
                  style={{ backgroundImage: `url(${profileMeta.blurDataUri})` }}
                  aria-hidden="true"
                />

                {/* Multi-format responsive picture with AVIF and WebP */}
                <picture className="relative z-10 block w-full h-full">
                  <source
                    srcSet={`${profileMeta.src800Avif} 800w, ${profileMeta.src400Avif} 400w`}
                    type="image/avif"
                    sizes="(max-width: 640px) 192px, 224px"
                  />
                  <source
                    srcSet={`${profileMeta.src800Webp} 800w, ${profileMeta.src400Webp} 400w`}
                    type="image/webp"
                    sizes="(max-width: 640px) 192px, 224px"
                  />
                  <img
                    src={profileMeta.src400Webp}
                    alt="Wave Cantery Ambray studio portrait"
                    width={400}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </picture>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {contactData.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                Full-Stack &amp; Backend Engineer
              </p>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* Primary Email Direct Copy Box */}
            <div className="p-4 rounded-2xl bg-[var(--border-hairline)] border border-[var(--border-hairline)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl glass-dock text-[var(--accent-titanium)]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-tertiary)]">
                    Direct Email
                  </div>
                  <div className="font-mono text-sm font-semibold text-[var(--text-primary)]">
                    {contactData.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-mono font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Messaging Direct Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={contactData.whatsappUrl || 'https://wa.me/639654297640'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl glass-dock border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 rounded-xl bg-[var(--border-hairline)] text-[var(--accent-signal)] group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-tertiary)]">
                    WhatsApp Direct
                  </div>
                  <div className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                    +63 965 429 7640
                  </div>
                </div>
              </a>

              <a
                href={contactData.viberUrl || 'viber://chat?number=%2B639654297640'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl glass-dock border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] flex items-center gap-3 transition-colors group"
              >
                <div className="p-2 rounded-xl bg-[var(--border-hairline)] text-[var(--accent-titanium)] group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-wider uppercase text-[var(--text-tertiary)]">
                    Viber Direct
                  </div>
                  <div className="text-xs font-mono font-semibold text-[var(--text-primary)]">
                    +63 965 429 7640
                  </div>
                </div>
              </a>
            </div>

            {/* Profiles & Resume */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href={contactData.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl glass-dock border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] flex items-center justify-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Github className="w-4 h-4 text-[var(--accent-titanium)]" />
                <span>GitHub</span>
              </a>

              <a
                href={contactData.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl glass-dock border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] flex items-center justify-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Linkedin className="w-4 h-4 text-[var(--accent-titanium)]" />
                <span>LinkedIn</span>
              </a>

              <a
                href={contactData.resumeUrl}
                download="Wave_Ambray_Resume.pdf"
                className="p-3 rounded-2xl glass-dock border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] flex items-center justify-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Download className="w-4 h-4 text-[var(--accent-titanium)]" />
                <span>Résumé PDF</span>
              </a>
            </div>

            {/* Geographic Coordinates & Live PHT Clock */}
            <div className="p-4 rounded-2xl bg-[var(--border-hairline)] border border-[var(--border-hairline)] flex flex-col gap-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2 text-[var(--accent-titanium)] font-mono font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{contactData.location}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-[var(--text-primary)]">
                <Clock className="w-3.5 h-3.5 shrink-0 text-[var(--accent-signal)]" />
                <span className="inline-flex items-center gap-1.5 font-mono-numbers font-semibold">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-signal)]" aria-hidden="true" />
                  {tzSnapshot.manilaTime24} PHT
                </span>
                <span className="text-[var(--border-subtle)]" aria-hidden="true">·</span>
                <span className="text-[var(--text-secondary)]">{tzSnapshot.offsetDeltaLabel}</span>
              </div>

              <div className="flex items-center gap-2 text-[var(--accent-signal)] font-mono text-[11px] pt-1 border-t border-[var(--border-hairline)]">
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span>{contactData.availability}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

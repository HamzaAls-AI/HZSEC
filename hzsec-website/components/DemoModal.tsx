'use client';

import { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';

interface DemoModalProps {
  videoUrl?: string;
  children: React.ReactNode;
}

export function DemoModal({ videoUrl, children }: DemoModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Trigger: play button overlaid on whatever is passed as children */}
      <div className="relative group cursor-pointer" onClick={() => setOpen(true)}>
        {children}

        {/* Overlay — subtle at rest, stronger on hover */}
        <div className="absolute inset-0 rounded-xl bg-black/25 group-hover:bg-black/50 transition-colors duration-200 flex flex-col items-center justify-center gap-3">
          {/* Play circle */}
          <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/40 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-white/25 group-hover:border-white/60 transition-all duration-200">
            <Play size={20} className="text-white ml-1" fill="white" />
          </div>
          <span className="font-mono text-xs text-white/70 group-hover:text-white/90 tracking-widest uppercase transition-colors duration-200">
            Watch demo
          </span>
        </div>
      </div>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          {/* Modal container */}
          <div
            className="relative w-full max-w-[900px] rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors"
              aria-label="Close demo"
            >
              <X size={14} />
            </button>

            {/* Video or placeholder */}
            <div className="aspect-video bg-[#0b0c10] w-full">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                /* Placeholder — shown until a real URL is dropped in */
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 select-none">
                  {/* HZSec shield logo */}
                  <svg
                    className="text-accent opacity-40"
                    width="48"
                    height="56"
                    viewBox="0 0 48 56"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 4 L44 4 L44 32 Q44 48 24 54 Q4 48 4 32 Z"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />
                    <line x1="10" y1="16" x2="10" y2="36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="10" y1="26" x2="20" y2="26" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="20" y1="16" x2="20" y2="36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="25" y1="16" x2="38" y2="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <line x1="38" y1="16" x2="25" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <line x1="25" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="text-center">
                    <p className="text-white/80 font-light text-xl tracking-tight">Demo video coming soon</p>
                    <p className="text-white/30 font-mono text-xs mt-2">Drop in a YouTube or Loom URL to go live instantly</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

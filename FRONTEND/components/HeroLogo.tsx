import type { CSSProperties } from 'react';

const STAR_OUTLINE =
  'M 50,0 L 57,39 L 80,20 L 61,43 L 100,50 L 61,57 L 80,80 L 57,61 L 50,100 L 43,61 L 20,80 L 39,57 L 0,50 L 39,43 L 20,20 L 43,39 Z';
const STAR_FACETS = `
  M 50,50 L 50,0 L 43,39 Z
  M 50,50 L 80,20 L 57,39 Z
  M 50,50 L 100,50 L 61,43 Z
  M 50,50 L 80,80 L 61,57 Z
  M 50,50 L 50,100 L 57,61 Z
  M 50,50 L 20,80 L 43,61 Z
  M 50,50 L 0,50 L 39,57 Z
  M 50,50 L 20,20 L 39,43 Z
`;

function StarGlyph({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={STAR_OUTLINE} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" strokeMiterlimit="10" />
      <path d="M 50,0 L 50,100 M 0,50 L 100,50 M 20,20 L 80,80 M 20,80 L 80,20" stroke="currentColor" strokeWidth="1.5" />
      <path d={STAR_FACETS} fill="currentColor" />
    </svg>
  );
}

export default function HeroLogo() {
  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 select-none pointer-events-none">
      <StarGlyph
        className="lu-hero-star absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-400 opacity-[0.06]"
        style={{ width: 'min(88vw, 640px)', height: 'min(88vw, 640px)' }}
      />

      <p className="lu-hero-rise font-label text-[9px] md:text-[11px] tracking-[0.45em] uppercase text-zinc-500 mb-6 md:mb-10">
        High-End Streetwear — 226
      </p>

      <h1 className="relative flex flex-col items-center" aria-label="LEVEL UP">
        <span
          className="lu-hero-rise font-logo font-black uppercase text-black whitespace-nowrap"
          style={{ fontSize: 'clamp(3.75rem, 19vw, 12rem)', lineHeight: 0.92, letterSpacing: '-0.04em' }}
        >
          Level
        </span>

        <span className="lu-hero-rise flex items-center justify-center gap-5 md:gap-10 w-full my-5 md:my-8" style={{ animationDelay: '0.15s' }}>
          <span className="block h-px w-14 sm:w-24 md:w-44 bg-zinc-300" />
          <StarGlyph className="lu-hero-spin text-black shrink-0 w-8 h-8 md:w-14 md:h-14" />
          <span className="block h-px w-14 sm:w-24 md:w-44 bg-zinc-300" />
        </span>

        <span className="flex items-center gap-4 md:gap-8">
          <span
            className="lu-hero-rise lu-outline-text font-logo font-black uppercase whitespace-nowrap"
            style={{ fontSize: 'clamp(3.75rem, 19vw, 12rem)', lineHeight: 0.92, letterSpacing: '-0.04em', animationDelay: '0.25s' }}
          >
            Up
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            aria-hidden="true"
            className="lu-hero-float text-black w-[0.42em] h-[0.42em] md:w-[0.34em] md:h-[0.34em]"
            style={{ fontSize: 'clamp(3.75rem, 19vw, 12rem)' }}
          >
            <path d="M12 21V3M5 10l7-7 7 7" />
          </svg>
        </span>
      </h1>

      <p
        className="lu-hero-rise mt-6 md:mt-10 font-label text-[9px] md:text-[11px] tracking-[0.4em] uppercase text-zinc-400 text-center"
        style={{ animationDelay: '0.35s' }}
      >
        Éléve ton style — New Season
      </p>
    </div>
  );
}

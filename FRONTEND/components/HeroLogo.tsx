import { useEffect, useRef, type CSSProperties } from 'react';

const STAR_OUTLINE =
  'M 50,0 L 57,39 L 80,20 L 61,43 L 100,50 L 61,57 L 80,80 L 57,61 L 50,100 L 43,61 L 20,80 L 39,57 L 0,50 L 39,43 L 20,20 L 43,39 Z';
const STAR_CROSS = 'M 50,0 L 50,100 M 0,50 L 100,50 M 20,20 L 80,80 M 20,80 L 80,20';
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

function StarGlyph({
  className = '',
  style,
  variant = 'full',
}: {
  className?: string;
  style?: CSSProperties;
  variant?: 'full' | 'outline';
}) {
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
      {variant === 'full' ? (
        <>
          <path d={STAR_CROSS} stroke="currentColor" strokeWidth="1.5" />
          <path d={STAR_FACETS} fill="currentColor" />
        </>
      ) : (
        <path d="M 50,50 L 50,0 L 43,39 Z M 50,50 L 80,20 L 57,39 Z M 50,50 L 100,50 L 61,43 Z M 50,50 L 80,80 L 61,57 Z M 50,50 L 50,100 L 57,61 Z M 50,50 L 20,80 L 43,61 Z M 50,50 L 0,50 L 39,57 Z M 50,50 L 20,20 L 39,43 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="miter" />
      )}
    </svg>
  );
}

const WORD_SIZE = 'clamp(3.75rem, 19vw, 12rem)';

const TICKER_ITEMS = [
  'LEVEL UP',
  'HIGH-END STREETWEAR',
  'OUAGADOUGOU — 226',
  'NEW SEASON DROP',
  'LIVRAISON PARTOUT AU BURKINA',
];

function RevealLetter({ letter, delay, outline = false }: { letter: string; delay: number; outline?: boolean }) {
  return (
    <span className="lu-letter inline-block" style={{ animationDelay: `${delay}s` }} aria-hidden="true">
      <span
        className={`pointer-events-auto inline-block cursor-default font-logo font-black uppercase transition-transform duration-300 hover:-translate-y-[0.06em] ${
          outline ? 'lu-outline-text' : 'text-black'
        }`}
        style={{ fontSize: WORD_SIZE, letterSpacing: '-0.04em', lineHeight: 0.92 }}
      >
        {letter}
      </span>
    </span>
  );
}

function TickerRow() {
  return (
    <div className="flex shrink-0 items-center">
      {TICKER_ITEMS.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-6 md:px-10 font-label text-[10px] md:text-xs font-bold uppercase tracking-[0.35em] text-black">
            {item}
          </span>
          <StarGlyph variant="outline" className="lu-hero-spin-slow h-3 w-3 shrink-0 text-black md:h-4 md:w-4" />
        </span>
      ))}
    </div>
  );
}

export default function HeroLogo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        el.style.setProperty('--px', `${(x * 14).toFixed(1)}px`);
        el.style.setProperty('--py', `${(y * 10).toFixed(1)}px`);
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative z-10 flex h-full w-full select-none flex-col items-center justify-center px-4"
    >
      <StarGlyph
        variant="outline"
        className="lu-hero-spin-ambient absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-400 opacity-[0.06]"
        style={{ width: 'min(88vw, 640px)', height: 'min(88vw, 640px)' }}
      />
      <StarGlyph
        variant="outline"
        className="lu-hero-spin-reverse absolute right-[6%] top-[12%] h-14 w-14 text-zinc-400 opacity-30 md:h-24 md:w-24"
      />
      <StarGlyph
        variant="outline"
        className="lu-hero-spin-slow absolute bottom-[20%] left-[7%] h-8 w-8 text-zinc-300 opacity-60 md:h-12 md:w-12"
      />

      <p
        className="lu-hero-rise mb-6 font-label text-[9px] uppercase tracking-[0.45em] text-zinc-500 md:mb-8 md:text-[11px]"
        style={{ animationDelay: '0.1s' }}
      >
        High-End Streetwear — Ouagadougou 226
      </p>

      <h1
        className="relative flex flex-col items-center"
        style={{
          transform: 'translate3d(var(--px, 0px), var(--py, 0px), 0)',
          transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        aria-label="LEVEL UP"
      >
        <span className="block overflow-hidden leading-none pb-[0.03em]">
          {['L', 'E', 'V', 'E', 'L'].map((letter, i) => (
            <RevealLetter key={i} letter={letter} delay={0.15 + i * 0.08} />
          ))}
        </span>

        <span
          className="lu-hero-rise my-4 flex w-full items-center justify-center gap-4 md:my-6 md:gap-6"
          style={{ animationDelay: '0.5s' }}
          aria-hidden="true"
        >
          <span className="lu-ruler block h-3 w-32 sm:w-52 md:w-80" />
          <StarGlyph className="lu-hero-spin h-8 w-8 shrink-0 text-black md:h-12 md:w-12" />
        </span>

        <span className="flex items-end justify-center">
          <span className="block overflow-hidden pb-[0.04em] leading-none">
            {['U', 'P'].map((letter, i) => (
              <RevealLetter key={i} letter={letter} delay={0.6 + i * 0.08} outline />
            ))}
          </span>
          <span className="lu-hero-rise inline-block" style={{ animationDelay: '0.85s' }} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
              className="lu-arrow-loop block text-black"
              style={{ fontSize: WORD_SIZE, width: '0.32em', height: '0.32em', marginBottom: '0.1em' }}
            >
              <path d="M12 21V4M5 11l7-7 7 7" />
            </svg>
          </span>
        </span>
      </h1>

      <p
        className="lu-hero-rise mt-6 text-center font-label text-[9px] uppercase tracking-[0.4em] text-zinc-400 md:mt-8 md:text-[11px]"
        style={{ animationDelay: '1s' }}
      >
        Éléve ton style — New Season
      </p>

      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-black bg-white py-3 md:py-3.5">
        <div className="lu-marquee flex w-max">
          <TickerRow />
          <TickerRow />
        </div>
      </div>
    </div>
  );
}

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
const BG_WORD_SIZE = 'clamp(6rem, 26vw, 20rem)';

const TICKER_ITEMS = [
  'LEVEL UP',
  'HIGH-END STREETWEAR',
  'OUAGADOUGOU — 226',
  'NEW SEASON DROP',
  'LIVRAISON PARTOUT AU BURKINA',
];

const BAND_ITEMS = [
  'NOUVELLE COLLECTION',
  'LEVEL UP',
  'DROP SAISONNIER',
  'LEVEL UP',
  'STREETWEAR PREMIUM',
  'LEVEL UP',
];

function RevealLetter({ letter, delay, outline = false }: { letter: string; delay: number; outline?: boolean }) {
  return (
    <span className="lu-letter inline-block" style={{ animationDelay: `${delay}s` }} aria-hidden="true">
      <span className="lu-wave inline-block" style={{ animationDelay: `${(delay * 2.2).toFixed(2)}s`, fontSize: WORD_SIZE }}>
        <span
          className={`pointer-events-auto inline-block cursor-default font-logo font-black uppercase transition-transform duration-300 hover:-translate-y-[0.05em] ${
            outline ? 'lu-outline-text' : 'text-black'
          }`}
          style={{ fontSize: WORD_SIZE, letterSpacing: '-0.04em', lineHeight: 0.92 }}
        >
          {letter}
        </span>
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
          <StarGlyph variant="outline" className="h-3 w-3 shrink-0 text-black md:h-4 md:w-4" />
        </span>
      ))}
    </div>
  );
}

function BandRow() {
  return (
    <div className="flex shrink-0 items-center">
      {BAND_ITEMS.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-5 md:px-8 font-label text-[9px] md:text-[11px] font-bold uppercase tracking-[0.3em] text-white">
            {item}
          </span>
          <StarGlyph variant="outline" className="h-2.5 w-2.5 shrink-0 text-white md:h-3 md:w-3" />
        </span>
      ))}
    </div>
  );
}

function BgMarqueeRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={`${reverse ? 'lu-marquee-bg-rev' : 'lu-marquee-bg'} flex w-max`} aria-hidden="true">
      {[0, 1].map((half) => (
        <div key={half} className="flex shrink-0">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="lu-bg-word whitespace-nowrap pr-[0.18em] font-logo font-black uppercase"
              style={{ fontSize: BG_WORD_SIZE, lineHeight: 0.82 }}
            >
              Level Up
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function HeroLogo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let scrollRaf = 0;
    let mouseRaf = 0;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const y = window.scrollY;
        el.style.setProperty('--sy', `${(y * 0.28).toFixed(1)}px`);
        el.style.setProperty('--sy-bg', `${(y * 0.12).toFixed(1)}px`);
      });
    };

    const onMouse = fine
      ? (e: MouseEvent) => {
          if (mouseRaf) return;
          mouseRaf = requestAnimationFrame(() => {
            mouseRaf = 0;
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            el.style.setProperty('--px', `${(x * 12).toFixed(1)}px`);
            el.style.setProperty('--py', `${(y * 8).toFixed(1)}px`);
          });
        }
      : null;

    window.addEventListener('scroll', onScroll, { passive: true });
    if (onMouse) window.addEventListener('mousemove', onMouse);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (onMouse) window.removeEventListener('mousemove', onMouse);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (mouseRaf) cancelAnimationFrame(mouseRaf);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative z-10 h-full w-full select-none">
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ transform: 'translate3d(0, var(--sy-bg, 0px), 0)' }}
        aria-hidden="true"
      >
        <BgMarqueeRow />
        <BgMarqueeRow reverse />
      </div>

      <StarGlyph
        variant="outline"
        className="lu-hero-spin-ambient pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-400 opacity-[0.05]"
        style={{ width: 'min(80vw, 560px)', height: 'min(80vw, 560px)' }}
      />

      <div
        className="absolute left-1/2 top-[12%] w-[130vw] -translate-x-1/2 -rotate-2 overflow-hidden border-y-2 border-black bg-black py-2 md:py-3"
        aria-hidden="true"
      >
        <div className="lu-marquee-band flex w-max">
          <BandRow />
          <BandRow />
        </div>
      </div>

      <div
        className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4"
        style={{
          transform: 'translate3d(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px)), 0)',
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <p
          className="lu-hero-rise mb-6 font-label text-[9px] uppercase tracking-[0.45em] text-zinc-500 md:mb-8 md:text-[11px]"
          style={{ animationDelay: '0.1s' }}
        >
          High-End Streetwear — Ouagadougou 226
        </p>

        <h1 className="relative flex flex-col items-center" aria-label="LEVEL UP">
          <span className="block overflow-hidden pb-[0.03em] leading-none">
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

          <span className="relative flex items-end justify-center">
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
                className="lu-arrow-loop block text-[#E6320F]"
                style={{ fontSize: WORD_SIZE, width: '0.32em', height: '0.32em', marginBottom: '0.1em' }}
              >
                <path d="M12 21V4M5 11l7-7 7 7" />
              </svg>
            </span>
            <span className="lu-badge-pop absolute -top-4 right-[-16px] z-20 md:-top-6 md:right-[-28px]" aria-hidden="true">
              <span className="lu-badge-wiggle -rotate-6 bg-[#E6320F] px-2.5 py-1.5 md:px-3.5 md:py-2">
                <span className="block whitespace-nowrap font-label text-[8px] font-bold uppercase tracking-[0.22em] text-white md:text-[10px]">
                  New Drop
                </span>
              </span>
            </span>
          </span>
        </h1>
      </div>

      <div className="lu-grain pointer-events-none absolute inset-0 z-20" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-black bg-white py-3 md:py-3.5">
        <div className="lu-marquee flex w-max">
          <TickerRow />
          <TickerRow />
        </div>
      </div>
    </div>
  );
}

import type { CSSProperties } from 'react';

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

export default function StarGlyph({
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

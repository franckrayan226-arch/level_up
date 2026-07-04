import { FC } from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: FC<BrandLogoProps> = ({ className = "" }) => {
  return (
    <span className={`inline-flex items-center align-middle ${className}`}>
      <span>LEVEL</span>
      <svg 
        viewBox="0 0 100 100" 
        className="w-[1.05em] h-[1.05em] shrink-0 text-current mx-[0.1em]" 
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'translateY(-0.06em)' }}
      >
        {/* Full outline of the 8-pointed star */}
        <path 
          d="M 50,0 L 57,39 L 80,20 L 61,43 L 100,50 L 61,57 L 80,80 L 57,61 L 50,100 L 43,61 L 20,80 L 39,57 L 0,50 L 39,43 L 20,20 L 43,39 Z" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinejoin="miter" 
          strokeMiterlimit="10" 
        />
        
        {/* Internal crossing division lines */}
        <path 
          d="M 50,0 L 50,100 M 0,50 L 100,50 M 20,20 L 80,80 M 20,80 L 80,20" 
          stroke="currentColor" 
          strokeWidth="1.5" 
        />
        
        {/* Solid black alternating facets */}
        <path 
          d="
            M 50,50 L 50,0 L 43,39 Z
            M 50,50 L 80,20 L 57,39 Z
            M 50,50 L 100,50 L 61,43 Z
            M 50,50 L 80,80 L 61,57 Z
            M 50,50 L 50,100 L 57,61 Z
            M 50,50 L 20,80 L 43,61 Z
            M 50,50 L 0,50 L 39,57 Z
            M 50,50 L 20,20 L 39,43 Z
          " 
          fill="currentColor" 
        />
      </svg>
      <span>UP</span>
    </span>
  );
};

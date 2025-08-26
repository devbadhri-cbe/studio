
import * as React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <path 
            d="M16 30C16 30 30 24 30 16V6L16 2L2 6V16C2 24 16 30 16 30Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="currentColor" 
            fillOpacity="0.1" 
        />
        <path 
            d="M8 16H12L14 10L18 22L20 16H24"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </svg>
  );
}

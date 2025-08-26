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
            d="M22 12C22 14.2091 20.2091 16 18 16C15.7909 16 14 14.2091 14 12C14 9.79086 15.7909 8 18 8C19.023 8 19.9478 8.40221 20.6212 9.0756C21.2946 9.749 21.7951 10.6433 21.9515 11.6165" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            transform="translate(-2, 2)"
        />
        <path 
            d="M14 17.6165C14.0485 18.5897 14.549 19.484 15.2224 20.1574C15.8958 20.8308 16.8206 21.233 17.8435 21.233C20.0527 21.233 21.8435 19.4421 21.8435 17.233C21.8435 15.0238 20.0527 13.233 17.8435 13.233" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            transform="translate(-2, 2)"
        />
    </svg>
  );
}

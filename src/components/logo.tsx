
import * as React from 'react';
import { cn } from '@/lib/utils';

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
        <defs>
            <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="hsl(var(--primary))" floodOpacity="0.3" />
            </filter>
        </defs>
        <path 
            d="M16 30C16 30 30 24 30 16V6L16 2L2 6V16C2 24 16 30 16 30Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="currentColor" 
            fillOpacity="0.1" 
            style={{ filter: 'url(#logo-shadow)' }}
        />
        <polyline
            className="animate-pulse-trace text-destructive"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="8,16 12,16 14,10 18,22 20,16 24,16"
        />
    </svg>
  );
}

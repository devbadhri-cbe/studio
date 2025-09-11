
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
        <linearGradient id="shieldGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#D1D5DB" />
            <stop offset="100%" stopColor="#9CA3AF" />
        </linearGradient>
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.1" />
        </filter>
      </defs>
      <g filter="url(#logo-shadow)">
        <path
            d="M16 2 L2 6 V16 C2 24 16 30 16 30 C16 30 30 24 30 16 V6 L16 2 Z"
            fill="url(#shieldGradient)"
        />
        <path
            d="M16 4.1 L4.5 7.6 V16 C4.5 22.5 16 27.5 16 27.5 C16 27.5 27.5 22.5 27.5 16 V7.6 L16 4.1 Z"
            fill="#FFFFFF"
        />
        <style>
          {`
            .pulse-trace {
              stroke-dasharray: 0 100;
              stroke-dashoffset: 0;
              animation: pulse-trace 2s ease-in-out infinite;
            }
            @keyframes pulse-trace {
              0% {
                stroke-dasharray: 0 100;
                stroke-dashoffset: 0;
              }
              50% {
                stroke-dasharray: 100 100;
                stroke-dashoffset: 0;
              }
              100% {
                stroke-dasharray: 100 100;
                stroke-dashoffset: -100;
              }
            }
          `}
        </style>
        <polyline
            className="pulse-trace"
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="8,16 12,16 14,10 18,22 20,16 24,16"
        />
      </g>
    </svg>
  );
}

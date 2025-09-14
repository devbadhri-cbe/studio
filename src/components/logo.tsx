
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
        <linearGradient id="solidMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D1D5DB" />
          <stop offset="50%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#D1D5DB" />
        </linearGradient>
         <linearGradient id="solidMetalDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="50%" stopColor="#374151" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>
      </defs>
      
      {/* Light Mode Logo */}
      <g className="dark:hidden">
        <path
          d="M16 2 L2 6 V16 C2 24 16 30 16 30 C16 30 30 24 30 16 V6 L16 2 Z"
          fill="url(#solidMetal)"
          stroke="#6B7280"
          strokeWidth="0.5"
        />
        <path
          d="M16 4.1 L4.5 7.6 V16 C4.5 22.5 16 27.5 16 27.5 C16 27.5 27.5 22.5 27.5 16 V7.6 L16 4.1 Z"
          fill="#F9FAFB"
        />
      </g>

      {/* Dark Mode Logo */}
       <g className="hidden dark:block">
         <path
          d="M16 2 L2 6 V16 C2 24 16 30 16 30 C16 30 30 24 30 16 V6 L16 2 Z"
          fill="url(#solidMetalDark)"
          stroke="#9CA3AF"
          strokeWidth="0.5"
        />
         <path
          d="M16 4.1 L4.5 7.6 V16 C4.5 22.5 16 27.5 16 27.5 C16 27.5 27.5 22.5 27.5 16 V7.6 L16 4.1 Z"
          fill="hsl(var(--card))"
        />
      </g>
      
      
      {/* Pulsating Graph */}
      <style className="no-print">
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
      <g className="no-print">
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
       <g className="hidden print:block">
         <polyline
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

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
        d="M26.9,6.1C24.2,3.4,20.2,2,16,2S7.8,3.4,5.1,6.1C2.4,8.8,1,12.8,1,17s1.4,8.2,4.1,10.9S11.8,31,16,31s8.2-1.4,10.9-4.1S31,21.2,31,17S29.6,8.8,26.9,6.1z M25.5,26.5c-2.4,2.4-5.6,3.5-9.5,3.5s-7.1-1.2-9.5-3.5C4.2,24.1,3,20.9,3,17s1.2-7.1,3.5-9.5C8.9,5.2,12.1,4,16,4s7.1,1.2,9.5,3.5c2.4,2.4,3.5,5.6,3.5,9.5S27.8,24.1,25.5,26.5z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M23,15h-6V9c0-0.6-0.4-1-1-1s-1,0.4-1,1v6H9c-0.6,0-1,0.4-1,1s0.4,1,1,1h6v6c0,0.6,0.4,1,1,1s1-0.4,1-1v-6h6c0.6,0,1-0.4,1-1S23.6,15,23,15z"
        fill="currentColor"
      />
    </svg>
  );
}

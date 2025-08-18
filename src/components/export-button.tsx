'use client';

import { FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';

export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 gap-1')}>
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export PDF</span>
    </button>
  );
}

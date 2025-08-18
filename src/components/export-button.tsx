'use client';

import { FileDown } from 'lucide-react';
import { Button } from './ui/button';

export function ExportButton() {
  return (
    <Button onClick={() => window.print()} size="sm" variant="outline" className="h-8 gap-1">
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export PDF</span>
    </Button>
  );
}

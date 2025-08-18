'use client';

import { FileDown } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export function ExportButton() {
  const { toast } = useToast();

  const handlePrint = () => {
    toast({
      title: 'Generating Report...',
      description: "Your browser's print dialog will open. Select 'Save as PDF' to download.",
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <Button onClick={handlePrint} size="sm" variant="outline" className="h-8 gap-1">
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export PDF</span>
    </Button>
  );
}

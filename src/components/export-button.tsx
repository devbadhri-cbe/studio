'use client';

import { FileDown } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export function ExportButton() {
  const { toast } = useToast();

  const handlePrint = () => {
    // Call window.print() first to ensure it's a direct result of the user click.
    window.print();
    // Then show the toast notification.
    toast({
      title: 'Generating Report...',
      description: "Your browser's print dialog is open. Select 'Save as PDF' to download.",
    });
  };

  return (
    <Button onClick={handlePrint} size="sm" variant="outline" className="h-8 gap-1">
      <FileDown className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export PDF</span>
    </Button>
  );
}

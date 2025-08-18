'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Download, Upload } from 'lucide-react';
import Papa from 'papaparse';

export function DataManagementButtons() {
  const { profile, records, lipidRecords, importData } = useApp();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const dataToExport = {
        profile,
        records,
        lipidRecords,
      };

      const jsonData = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-guardian-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Your data has been downloaded.',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Could not export your data.',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);

        // Basic validation
        if (jsonData.profile && jsonData.records && jsonData.lipidRecords) {
          importData(jsonData);
          toast({
            title: 'Import Successful',
            description: 'Your data has been loaded.',
          });
        } else {
          throw new Error('Invalid file format.');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'The selected file is not a valid backup file.',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if(event.target) {
        event.target.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExport} size="sm" variant="outline" className="h-8 gap-1">
        <Download className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
      </Button>
      <Button onClick={handleImportClick} size="sm" variant="outline" className="h-8 gap-1">
        <Upload className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Import</span>
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
    </div>
  );
}

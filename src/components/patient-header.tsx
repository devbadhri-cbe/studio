'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { UploadRecordDialog } from './upload-record-dialog';
import { Button } from './ui/button';
import { FileText } from 'lucide-react';

export function PatientHeader() {
  const { patient, isReadOnlyView } = useApp();

  const pageTitle = `Welcome, ${patient?.name || ''}!`;
  
  return (
    <>
    <div className="flex-1">
      <h1 className="text-2xl md:text-3xl font-semibold font-headline">
        {pageTitle}
      </h1>
      <p className="text-muted-foreground mt-2">
          Your health overview. Consult your doctor before making any decisions.
      </p>
    </div>
    </>
  );
}

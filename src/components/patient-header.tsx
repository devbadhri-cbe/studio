
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { UploadRecordDialog } from './upload-record-dialog';

export function PatientHeader() {
  const { profile } = useApp();

  const pageTitle = `Welcome, ${profile.name || 'User'}!`;
  
  return (
    <>
    <div className="flex flex-col md:flex-row items-start md:items-end gap-4 justify-between">
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-semibold font-headline">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground mt-2">
            Your health overview. Consult your doctor before making any decisions.
        </p>
      </div>
      <div className="w-full md:w-auto flex items-center justify-start md:justify-end gap-2 md:gap-4 shrink-0">
        <UploadRecordDialog />
      </div>
    </div>
    </>
  );
}

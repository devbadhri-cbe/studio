'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { UploadRecordDialog } from './upload-record-dialog';
import { Button } from './ui/button';
import { FileText } from 'lucide-react';

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
      <div className="w-full md:w-auto flex items-center justify-center md:justify-end gap-2 md:gap-4 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/project-plan.html', '_blank')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Project Plan
          </Button>
        <UploadRecordDialog />
      </div>
    </div>
    </>
  );
}

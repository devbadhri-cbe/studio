'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { UploadRecordDialog } from './upload-record-dialog';
import { Button } from './ui/button';
import { UploadCloud, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PatientHeader() {
  const { patient } = useApp();
  const router = useRouter();

  const pageTitle = `Welcome, ${patient?.name || ''}!`;

  const handleShare = () => {
    router.push('/patient/report');
  };
  
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
      <div className="flex items-center gap-2">
        <UploadRecordDialog />
        <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Report
        </Button>
      </div>
    </>
  );
}

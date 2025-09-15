
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PatientHeader() {
  const { patient } = useApp();
  const router = useRouter();

  const pageTitle = `Welcome, ${patient?.name || ''}!`;
  
  return (
    <>
    <div className="flex-1 mt-5">
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

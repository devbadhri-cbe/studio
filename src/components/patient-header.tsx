
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { UploadRecordDialog } from './upload-record-dialog';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';


interface PatientHeaderProps {
    children?: React.ReactNode;
}

export function PatientHeader({ children }: PatientHeaderProps) {
  const { profile, isDoctorLoggedIn } = useApp();

  const pageTitle = isDoctorLoggedIn
    ? `${profile.name}'s Dashboard`
    : `Welcome, ${profile.name || 'User'}!`;
  
  return (
    <>
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="text-center md:text-left flex-1">
        <h1 className="text-2xl md:text-3xl font-semibold font-headline">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground mt-2">
            Consulting with: <span className="font-semibold text-foreground/90">{profile.doctorName || 'Not Assigned'}</span>
        </p>
      </div>
      <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 md:gap-4">
        <div className="flex items-center gap-2">
            <UploadRecordDialog />
        </div>
      </div>
    </div>
    </>
  );
}

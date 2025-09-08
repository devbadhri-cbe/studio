
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { UploadRecordDialog } from './upload-record-dialog';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';
import { EditDoctorDetailsDialog } from './edit-doctor-details-dialog';

export function PatientHeader() {
  const { profile, isDoctorLoggedIn } = useApp();
  const [isEditing, setIsEditing] = React.useState(false);

  const pageTitle = isDoctorLoggedIn
    ? `${profile.name}'s Dashboard`
    : `Welcome, ${profile.name || 'User'}!`;
  
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
         <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Consulting Doctor:</span>
            <span className="font-semibold">{profile.doctorName || 'Not Assigned'}</span>
            {!isDoctorLoggedIn && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                <Edit className="h-3 w-3" />
            </Button>
            )}
        </div>
      </div>
      <div className="w-full md:w-auto flex items-center justify-start md:justify-end gap-2 md:gap-4 shrink-0">
        <UploadRecordDialog />
      </div>
    </div>
    <EditDoctorDetailsDialog open={isEditing} onOpenChange={setIsEditing} />
    </>
  );
}

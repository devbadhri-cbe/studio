

'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { UploadRecordDialog } from './upload-record-dialog';
import { Button } from './ui/button';
import { Edit, Info } from 'lucide-react';
import { EditDoctorDetailsDialog } from './edit-doctor-details-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { auth } from '@/lib/auth';
import type { User } from 'firebase/auth';
import { doctorDetails } from '@/lib/doctor-data';


interface PatientHeaderProps {
    children?: React.ReactNode;
}

export function PatientHeader({ children }: PatientHeaderProps) {
  const { profile, isDoctorLoggedIn } = useApp();
  const [isEditing, setIsEditing] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const isDeveloper = user?.email === doctorDetails.developerEmail;

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
            Your health overview. Consult your doctor before making any decisions.
        </p>
      </div>
      <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 md:gap-4">
        <div className="flex items-center gap-3 text-sm">
            <div className='text-muted-foreground'>
                <p>Consulting</p>
                <p>with:</p>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-foreground text-base">{profile.doctorName || 'Not Set'}</span>
                 <div className="flex items-center gap-1">
                    {(isDoctorLoggedIn && isDeveloper) && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}

                    {!isDoctorLoggedIn && profile.doctorName && !profile.doctorUid && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Your doctor has not logged in yet. <br /> Use the share button to invite them.</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <UploadRecordDialog />
        </div>
      </div>
    </div>
    <EditDoctorDetailsDialog open={isEditing} onOpenChange={setIsEditing} />
    </>
  );
}



'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Card, CardContent } from './ui/card';

interface PatientHeaderProps {
    children?: React.ReactNode;
}

export function PatientHeader({ children }: PatientHeaderProps) {
  const { profile, isDoctorLoggedIn } = useApp();
  
  const pageTitle = isDoctorLoggedIn
    ? `${profile.name}'s Dashboard`
    : `Welcome, ${profile.name || 'User'}!`;
  
  const doctorName = profile.doctorName || 'your doctor';

  return (
    <Card className="shadow-xl">
      <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex flex-col items-center md:items-start flex-1 gap-4 w-full">
            <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-semibold font-headline">
                    {pageTitle}
                </h1>
                <p className="text-sm text-muted-foreground">Your health overview. Consult {doctorName} before making any decisions.</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

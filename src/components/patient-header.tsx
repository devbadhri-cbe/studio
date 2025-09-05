

'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { DiseasePanel } from './disease-panel';
import { BiomarkersPanel } from './biomarkers-panel';

export function PatientHeader() {
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
         {isDoctorLoggedIn && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DiseasePanel />
                <BiomarkersPanel />
            </div>
        )}
      </CardContent>
    </Card>
  );
}

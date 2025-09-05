

'use client';

import * as React from 'react';
import { Settings, Droplet } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { HemoglobinCard } from './hemoglobin-card';
import { AddRecordDialog } from './add-record-dialog';
import { AddFastingBloodGlucoseRecordDialog } from './add-fasting-blood-glucose-record-dialog';
import { AddHemoglobinRecordDialog } from './add-hemoglobin-record-dialog';

export function DiabetesCard() {
  const { isDoctorLoggedIn } = useApp();
  
  const icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const Actions = isDoctorLoggedIn ? (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
                <Settings className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel>Add New Record</DropdownMenuLabel>
            <DropdownMenuSeparator />
              <AddRecordDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Add HbA1c Record
                  </DropdownMenuItem>
              </AddRecordDialog>
              <AddFastingBloodGlucoseRecordDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Add Fasting Glucose Record
                  </DropdownMenuItem>
              </AddFastingBloodGlucoseRecordDialog>
               <AddHemoglobinRecordDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                     Add Hemoglobin Record
                  </DropdownMenuItem>
              </AddHemoglobinRecordDialog>
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <DiseasePanelCard title="Diabetes Panel" icon={icon} actions={Actions}>
        <Hba1cCard isReadOnly />
        <FastingBloodGlucoseCard isReadOnly />
        <HemoglobinCard isReadOnly />
    </DiseasePanelCard>
  );
}

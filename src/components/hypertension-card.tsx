

'use client';

import * as React from 'react';
import { Settings, Heart } from 'lucide-react';
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
import { BloodPressureCard } from './blood-pressure-card';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';


export function HypertensionCard() {
  const { isDoctorLoggedIn } = useApp();

  const icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
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
            <AddBloodPressureRecordDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Add Blood Pressure Record
                </DropdownMenuItem>
            </AddBloodPressureRecordDialog>
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <DiseasePanelCard title="Hypertension Panel" icon={icon} actions={Actions}>
       <BloodPressureCard isReadOnly />
    </DiseasePanelCard>
  );
}

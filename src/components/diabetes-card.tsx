

'use client';

import * as React from 'react';
import { Settings, Droplet } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/context/app-context';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { HemoglobinCard } from './hemoglobin-card';
import { DiseasePanelCard } from './disease-panel-card';

const DIABETES_PANEL_KEY = 'diabetes';

const availableBiomarkers = {
  hba1c: {
    label: 'HbA1c Card',
    component: <Hba1cCard key="hba1c" isReadOnly />,
  },
  glucose: {
    label: 'Fasting Blood Glucose Card',
    component: <FastingBloodGlucoseCard key="fbg" isReadOnly />,
  },
  hemoglobin: {
    label: 'Hemoglobin (Anemia) Card',
    component: <HemoglobinCard key="hemoglobin" isReadOnly />,
  },
};

type BiomarkerKey = keyof typeof availableBiomarkers;

export function DiabetesCard() {
  const { profile, isDoctorLoggedIn, toggleDiseaseBiomarker } = useApp();
  const enabledBiomarkers = profile.enabledBiomarkers?.[DIABETES_PANEL_KEY] || [];

  const visibleCards = (Object.keys(availableBiomarkers) as BiomarkerKey[])
    .filter(key => enabledBiomarkers.includes(key))
    .map(key => availableBiomarkers[key].component);
  
  const icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const Actions = isDoctorLoggedIn ? (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
                <Settings className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel>Panel Components</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(availableBiomarkers) as BiomarkerKey[]).map(key => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={enabledBiomarkers.includes(key)}
                onCheckedChange={() => toggleDiseaseBiomarker(DIABETES_PANEL_KEY, key)}
              >
                {availableBiomarkers[key].label}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <DiseasePanelCard title="Diabetes Panel" icon={icon} actions={Actions}>
        {visibleCards.length > 0 ? (
           visibleCards
        ) : (
            <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                <p className="text-center text-xs text-muted-foreground">No biomarker cards selected for this panel.</p>
                {isDoctorLoggedIn && <p className="text-center text-xs text-muted-foreground mt-1">Click the <Settings className="inline-block h-3 w-3" /> icon to add cards.</p>}
            </div>
        )}
    </DiseasePanelCard>
  );
}

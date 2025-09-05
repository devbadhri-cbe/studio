

'use client';

import * as React from 'react';
import { Settings, Heart } from 'lucide-react';
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
import { BloodPressureCard } from './blood-pressure-card';
import { DiseasePanelCard } from './disease-panel-card';


const HYPERTENSION_PANEL_KEY = 'hypertension';

const availableBiomarkers = {
  bloodPressure: {
    label: 'Blood Pressure Card',
    component: <BloodPressureCard key="bloodPressure" isReadOnly />,
  },
  // Add other potential hypertension-related cards here
};

type BiomarkerKey = keyof typeof availableBiomarkers;

export function HypertensionCard() {
  const { profile, isDoctorLoggedIn, toggleDiseaseBiomarker } = useApp();
  const enabledBiomarkers = profile.enabledBiomarkers?.[HYPERTENSION_PANEL_KEY] || [];

  const visibleCards = (Object.keys(availableBiomarkers) as BiomarkerKey[])
    .filter(key => enabledBiomarkers.includes(key))
    .map(key => availableBiomarkers[key].component);

  const icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
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
                onCheckedChange={() => toggleDiseaseBiomarker(HYPERTENSION_PANEL_KEY, key)}
              >
                {availableBiomarkers[key].label}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <DiseasePanelCard title="Hypertension Panel" icon={icon} actions={Actions}>
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


'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';


const HYPERTENSION_PANEL_KEY = 'hypertension';
const allHypertensionBiomarkers: BiomarkerKey[] = ['weight', 'bloodPressure'];

export function HypertensionCard() {
  const { isDoctorLoggedIn } = useApp();

  const icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  return (
    <DiseasePanelCard 
        title="Hypertension Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        panelKey={HYPERTENSION_PANEL_KEY}
        allPanelBiomarkers={allHypertensionBiomarkers}
    >
       <></>
    </DiseasePanelCard>
  );
}

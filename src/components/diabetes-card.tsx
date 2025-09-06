
'use client';

import * as React from 'react';
import { Droplet } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';

const DIABETES_PANEL_KEY = 'diabetes';
const allDiabetesBiomarkers: BiomarkerKey[] = ['hba1c', 'glucose', 'hemoglobin'];

export function DiabetesCard() {
  const { isDoctorLoggedIn } = useApp();
  
  const icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  return (
    <DiseasePanelCard 
        title="Diabetes Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        panelKey={DIABETES_PANEL_KEY}
        allPanelBiomarkers={allDiabetesBiomarkers}
    >
       <></>
    </DiseasePanelCard>
  );
}

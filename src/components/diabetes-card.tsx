
'use client';

import * as React from 'react';
import { Droplet } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { HemoglobinCard } from './hemoglobin-card';
import { InteractivePanelGrid } from './interactive-panel-grid';

const DIABETES_PANEL_KEY = 'diabetes';
const allDiabetesBiomarkers: BiomarkerKey[] = ['hba1c', 'glucose', 'hemoglobin'];

export function DiabetesCard() {
  const { isDoctorLoggedIn, profile } = useApp();
  const icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const enabledForPanel = profile.enabledBiomarkers?.[DIABETES_PANEL_KEY] || [];

  return (
    <DiseasePanelCard 
        title="Diabetes Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        panelKey={DIABETES_PANEL_KEY}
        allPanelBiomarkers={allDiabetesBiomarkers}
    >
       <InteractivePanelGrid>
          {enabledForPanel.includes('hba1c') && <Hba1cCard />}
          {enabledForPanel.includes('glucose') && <FastingBloodGlucoseCard />}
          {enabledForPanel.includes('hemoglobin') && <HemoglobinCard />}
       </InteractivePanelGrid>
    </DiseasePanelCard>
  );
}


'use client';

import * as React from 'react';
import { Droplet } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { HemoglobinCard } from './hemoglobin-card';

const DIABETES_PANEL_KEY = 'diabetes';
const allDiabetesBiomarkers: BiomarkerKey[] = ['hba1c', 'glucose', 'hemoglobin'];

const cardComponents: { [key in BiomarkerKey]?: React.ReactNode } = {
    hba1c: <Hba1cCard key="hba1c" />,
    glucose: <FastingBloodGlucoseCard key="glucose" />,
    hemoglobin: <HemoglobinCard key="hemoglobin" />,
};

export function DiabetesCard() {
  const { isDoctorLoggedIn, profile } = useApp();
  const icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const enabledForPanel = profile.enabledBiomarkers?.[DIABETES_PANEL_KEY] || [];

  const sortedEnabledCards = enabledForPanel
    .map(key => ({ key, ...availableBiomarkerCards[key as BiomarkerKey] }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(cardInfo => cardComponents[cardInfo.key as BiomarkerKey]);


  return (
    <DiseasePanelCard 
        title="Diabetes Panel" 
        icon={icon}
        panelKey={DIABETES_PANEL_KEY}
        allPanelBiomarkers={allDiabetesBiomarkers}
    >
        {sortedEnabledCards}
    </DiseasePanelCard>
  );
}

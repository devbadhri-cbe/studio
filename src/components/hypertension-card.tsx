
'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';
import { WeightRecordCard } from './weight-record-card';
import { BloodPressureCard } from './blood-pressure-card';


const HYPERTENSION_PANEL_KEY = 'hypertension';
const allHypertensionBiomarkers: BiomarkerKey[] = ['weight', 'bloodPressure'];

const cardComponents: { [key in BiomarkerKey]?: React.ReactNode } = {
    weight: <WeightRecordCard key="weight" />,
    bloodPressure: <BloodPressureCard key="bloodPressure" />,
};

export function HypertensionCard() {
  const { profile } = useApp();
  const icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const enabledForPanel = profile.enabledBiomarkers?.[HYPERTENSION_PANEL_KEY] || [];
  
  const sortedEnabledCards = enabledForPanel
    .map(key => ({ key, ...availableBiomarkerCards[key as BiomarkerKey] }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(cardInfo => cardComponents[cardInfo.key as BiomarkerKey]);
    
  return (
    <DiseasePanelCard 
        title="Hypertension Panel" 
        icon={icon}
        panelKey={HYPERTENSION_PANEL_KEY}
        allPanelBiomarkers={allHypertensionBiomarkers}
    >
      {sortedEnabledCards}
    </DiseasePanelCard>
  );
}

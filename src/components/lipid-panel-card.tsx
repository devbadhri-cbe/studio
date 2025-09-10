
'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';
import { TotalCholesterolCard } from './total-cholesterol-card';
import { LdlCard } from './ldl-card';
import { HdlCard } from './hdl-card';
import { TriglyceridesCard } from './triglycerides-card';


const LIPID_PANEL_KEY = 'lipidPanel';
const allLipidBiomarkers: BiomarkerKey[] = ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'];

const cardComponents: { [key in BiomarkerKey]?: React.ReactNode } = {
    totalCholesterol: <TotalCholesterolCard key="totalCholesterol" />,
    ldl: <LdlCard key="ldl" />,
    hdl: <HdlCard key="hdl" />,
    triglycerides: <TriglyceridesCard key="triglycerides" />,
};

export function LipidPanelCard() {
  const { profile } = useApp();
  const icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const enabledForPanel = profile.enabledBiomarkers?.[LIPID_PANEL_KEY] || [];
  
  const sortedEnabledCards = enabledForPanel
    .map(key => ({ key, ...availableBiomarkerCards[key as BiomarkerKey] }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(cardInfo => cardComponents[cardInfo.key as BiomarkerKey]);

  return (
    <DiseasePanelCard 
        title="Lipid Panel" 
        icon={icon}
        panelKey={LIPID_PANEL_KEY}
        allPanelBiomarkers={allLipidBiomarkers}
    >
      {sortedEnabledCards}
    </DiseasePanelCard>
  );
}

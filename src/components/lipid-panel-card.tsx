
'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';
import { TotalCholesterolCard } from './total-cholesterol-card';
import { LdlCard } from './ldl-card';
import { HdlCard } from './hdl-card';
import { TriglyceridesCard } from './triglycerides-card';


const LIPID_PANEL_KEY = 'lipidPanel';
const allLipidBiomarkers: BiomarkerKey[] = ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'];

export function LipidPanelCard() {
  const { profile } = useApp();
  const icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const enabledForPanel = profile.enabledBiomarkers?.[LIPID_PANEL_KEY] || [];
  
  return (
    <DiseasePanelCard 
        title="Lipid Panel" 
        icon={icon}
        panelKey={LIPID_PANEL_KEY}
        allPanelBiomarkers={allLipidBiomarkers}
    >
      {enabledForPanel.includes('totalCholesterol') && <TotalCholesterolCard key="totalCholesterol" />}
      {enabledForPanel.includes('ldl') && <LdlCard key="ldl" />}
      {enabledForPanel.includes('hdl') && <HdlCard key="hdl" />}
      {enabledForPanel.includes('triglycerides') && <TriglyceridesCard key="triglycerides" />}
    </DiseasePanelCard>
  );
}

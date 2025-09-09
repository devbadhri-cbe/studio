
'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';
import { LipidCard } from './lipid-card';
import { TotalCholesterolCard } from './total-cholesterol-card';


const LIPIDS_PANEL_KEY = 'lipids';
const allLipidsBiomarkers: BiomarkerKey[] = ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'];

export function LipidsPanel() {
  const { profile } = useApp();

  const icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const enabledForPanel = profile.enabledBiomarkers?.[LIPIDS_PANEL_KEY] || [];

  const cardsToShow = [
    (enabledForPanel.includes('totalCholesterol') || enabledForPanel.includes('ldl') || enabledForPanel.includes('hdl') || enabledForPanel.includes('triglycerides')) && <LipidCard key="lipids" />,
  ].filter(Boolean);


  return (
    <DiseasePanelCard 
        title="Lipids Panel" 
        icon={icon}
        panelKey={LIPIDS_PANEL_KEY}
        allPanelBiomarkers={allLipidsBiomarkers}
    >
        {enabledForPanel.includes('totalCholesterol') && <TotalCholesterolCard />}
        {enabledForPanel.includes('ldl') && <div />}
        {enabledForPanel.includes('hdl') && <div />}
        {enabledForPanel.includes('triglycerides') && <div />}

        {enabledForPanel.length === 0 && (
            <div className="col-span-full flex h-full items-center justify-center min-h-[150px]">
                <p className="text-sm text-muted-foreground text-center">No lipid biomarkers enabled. <br/> Add a condition like 'Hyperlipidemia' to get started.</p>
            </div>
        )}
    </DiseasePanelCard>
  );
}

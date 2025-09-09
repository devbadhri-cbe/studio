
'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';
import { LipidCard } from './lipid-card';


const LIPIDS_PANEL_KEY = 'lipids';
const allLipidsBiomarkers: BiomarkerKey[] = ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'];

export function LipidsPanel() {
  const { isDoctorLoggedIn, profile } = useApp();

  const icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const enabledForPanel = profile.enabledBiomarkers?.[LIPIDS_PANEL_KEY] || [];

  const cardsToShow = [
    (enabledForPanel.includes('totalCholesterol') || enabledForPanel.includes('ldl') || enabledForPanel.includes('hdl') || enabledForPanel.includes('triglycerides')) && <LipidCard key="lipids" isReadOnly={!isDoctorLoggedIn} />,
  ].filter(Boolean);


  return (
    <DiseasePanelCard 
        title="Lipids Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        panelKey={LIPIDS_PANEL_KEY}
        allPanelBiomarkers={allLipidsBiomarkers}
    >
      {cardsToShow.length > 0 ? (
        <>
            {cardsToShow}
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">No lipid biomarkers enabled. <br/> Add a condition like 'Hyperlipidemia' to get started.</p>
        </div>
      )}
    </DiseasePanelCard>
  );
}


'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';
import { InteractivePanelGrid } from './interactive-panel-grid';
import { TotalCholesterolCard } from './total-cholesterol-card';
import { LdlCard } from './ldl-card';
import { HdlCard } from './hdl-card';
import { TriglyceridesCard } from './triglycerides-card';


const LIPIDS_PANEL_KEY = 'lipids';
const allLipidsBiomarkers: BiomarkerKey[] = ['totalCholesterol', 'ldl', 'hdl', 'triglycerides'];

export function LipidsPanel() {
  const { isDoctorLoggedIn, profile } = useApp();

  const icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const enabledForPanel = profile.enabledBiomarkers?.[LIPIDS_PANEL_KEY] || [];

  const cardsToShow = [
    enabledForPanel.includes('totalCholesterol') && <TotalCholesterolCard key="totalCholesterol" isReadOnly={!isDoctorLoggedIn} />,
    enabledForPanel.includes('ldl') && <LdlCard key="ldl" isReadOnly={!isDoctorLoggedIn} />,
    enabledForPanel.includes('hdl') && <HdlCard key="hdl" isReadOnly={!isDoctorLoggedIn} />,
    enabledForPanel.includes('triglycerides') && <TriglyceridesCard key="triglycerides" isReadOnly={!isDoctorLoggedIn} />
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
        <InteractivePanelGrid>
            {cardsToShow}
        </InteractivePanelGrid>
      ) : (
        <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground text-center">No lipid biomarkers enabled. <br/> Add a condition like 'Hyperlipidemia' to get started.</p>
        </div>
      )}
    </DiseasePanelCard>
  );
}



'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';
import { InteractivePanelGrid } from './interactive-panel-grid';
import { CustomBiomarkerCard } from './custom-biomarker-card';


const LIPIDS_PANEL_KEY = 'lipids';

export function LipidsPanel() {
  const { isDoctorLoggedIn, profile } = useApp();

  const icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const enabledForPanel = profile.enabledBiomarkers?.[LIPIDS_PANEL_KEY] || [];
  
  const allCustomBiomarkers = profile.customBiomarkers || [];

  const cardsToShow = enabledForPanel.map(biomarkerId => {
      const biomarker = allCustomBiomarkers.find(b => b.id === biomarkerId);
      if (biomarker) {
        return <CustomBiomarkerCard key={biomarker.id} biomarker={biomarker} isReadOnly={!isDoctorLoggedIn} />
      }
      return null;
  }).filter(Boolean);


  return (
    <DiseasePanelCard 
        title="Lipids Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        panelKey={LIPIDS_PANEL_KEY}
        allPanelBiomarkers={allCustomBiomarkers.map(b => b.id as BiomarkerKey)}
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

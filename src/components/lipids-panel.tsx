

'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';
import { LipidCard } from './lipid-card';
import { InteractivePanelGrid } from './interactive-panel-grid';


const LIPIDS_PANEL_KEY = 'lipids';
const allLipidsBiomarkers: BiomarkerKey[] = ['lipidProfile']; 

export function LipidsPanel() {
  const { isDoctorLoggedIn, profile } = useApp();

  const icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const enabledForPanel = profile.enabledBiomarkers?.[LIPIDS_PANEL_KEY] || [];
  
  return (
    <DiseasePanelCard 
        title="Lipids Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        panelKey={LIPIDS_PANEL_KEY}
        allPanelBiomarkers={allLipidsBiomarkers}
    >
        <InteractivePanelGrid>
            {enabledForPanel.includes('lipidProfile') && <LipidCard key="lipidProfile" />}
        </InteractivePanelGrid>
    </DiseasePanelCard>
  );
}

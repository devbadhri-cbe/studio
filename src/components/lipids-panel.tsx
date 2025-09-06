

'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { type BiomarkerKey } from '@/lib/biomarker-cards';


const LIPIDS_PANEL_KEY = 'lipids';
const allLipidsBiomarkers: BiomarkerKey[] = ['lipidProfile']; 

export function LipidsPanel() {
  const { isDoctorLoggedIn } = useApp();

  const icon = <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  return (
    <DiseasePanelCard 
        title="Lipids Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        panelKey={LIPIDS_PANEL_KEY}
        allPanelBiomarkers={allLipidsBiomarkers}
    >
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-4 min-h-[200px]">
            <p className="text-sm">This panel is not yet fully implemented.</p>
            <p className="text-xs">Detailed charts and record entry for LDL, HDL, and Triglycerides will be available soon.</p>
        </div>
    </DiseasePanelCard>
  );
}

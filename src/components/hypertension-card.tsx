

'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';
import { availableBiomarkerCards, BiomarkerKey } from '@/lib/biomarker-cards';
import { AddWeightRecordDialog } from './add-weight-record-dialog';


const HYPERTENSION_PANEL_KEY = 'hypertension';
const allHypertensionBiomarkers: BiomarkerKey[] = ['bloodPressure', 'weight'];

export function HypertensionCard() {
  const { isDoctorLoggedIn, profile } = useApp();

  const icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const addRecordActions = [
    { label: 'Add Blood Pressure Record', dialog: <AddBloodPressureRecordDialog /> },
    { label: 'Add Weight Record', dialog: <AddWeightRecordDialog /> },
  ];

  const enabledBiomarkers = profile.enabledBiomarkers?.[HYPERTENSION_PANEL_KEY] || allHypertensionBiomarkers;

  return (
    <DiseasePanelCard 
        title="Hypertension Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        addRecordActions={addRecordActions.map(action => ({
            label: action.label,
            action: () => {
                const trigger = document.querySelector(`[data-dialog-trigger-for="${action.label}"]`) as HTMLElement;
                trigger?.click();
            }
        }))}
        panelKey={HYPERTENSION_PANEL_KEY}
        enabledBiomarkers={enabledBiomarkers}
    >
       {/* Hidden dialog triggers */}
        {addRecordActions.map(action => (
            <div key={action.label} style={{ display: 'none' }}>
                {React.cloneElement(action.dialog, {
                    children: <button data-dialog-trigger-for={action.label}></button>
                })}
            </div>
        ))}
        
        {enabledBiomarkers.map(key => {
            const card = availableBiomarkerCards[key];
            return card ? card.component : null;
        })}
    </DiseasePanelCard>
  );
}

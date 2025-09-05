
'use client';

import * as React from 'react';
import { Droplet } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { DiseasePanelCard } from './disease-panel-card';
import { AddRecordDialog } from './add-record-dialog';
import { AddFastingBloodGlucoseRecordDialog } from './add-fasting-blood-glucose-record-dialog';
import { AddHemoglobinRecordDialog } from './add-hemoglobin-record-dialog';
import { type BiomarkerKey } from '@/lib/biomarker-cards';

const DIABETES_PANEL_KEY = 'diabetes';
const allDiabetesBiomarkers: BiomarkerKey[] = ['hba1c', 'glucose', 'hemoglobin'];

export function DiabetesCard() {
  const { isDoctorLoggedIn, profile } = useApp();
  
  const icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;
  
  const addRecordActions = [
    { label: 'Add HbA1c Record', dialog: <AddRecordDialog /> },
    { label: 'Add Fasting Glucose Record', dialog: <AddFastingBloodGlucoseRecordDialog /> },
    { label: 'Add Hemoglobin Record', dialog: <AddHemoglobinRecordDialog /> },
  ];

  const enabledBiomarkers = profile.enabledBiomarkers?.[DIABETES_PANEL_KEY] || allDiabetesBiomarkers;

  return (
    <DiseasePanelCard 
        title="Diabetes Panel" 
        icon={icon}
        isDoctorLoggedIn={isDoctorLoggedIn}
        addRecordActions={addRecordActions.map(action => ({
            label: action.label,
            action: () => {
                const trigger = document.querySelector(`[data-dialog-trigger-for="${action.label}"]`) as HTMLElement;
                trigger?.click();
            }
        }))}
        panelKey={DIABETES_PANEL_KEY}
        allPanelBiomarkers={allDiabetesBiomarkers}
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
    </DiseasePanelCard>
  );
}

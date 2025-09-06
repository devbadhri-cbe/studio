
'use client';

import { useApp } from '@/context/app-context';
import { DiabetesCard } from './diabetes-card';
import { HypertensionCard } from './hypertension-card';
import { Card, CardContent } from './ui/card';
import * as React from 'react';
import { LipidsPanel } from './lipids-panel';
import { availableDiseasePanels } from '@/lib/biomarker-cards';

export function DiseasePanel() {
    const { isDoctorLoggedIn, profile } = useApp();

    const panelsToShow = React.useMemo(() => {
        if (isDoctorLoggedIn) {
            return availableDiseasePanels.map(p => React.cloneElement(p.component, { key: p.key }));
        }

        const enabledPanelKeys = Object.keys(profile.enabledBiomarkers || {}).filter(key => (profile.enabledBiomarkers?.[key] || []).length > 0);
        
        return availableDiseasePanels
            .filter(panel => enabledPanelKeys.includes(panel.key))
            .map(panel => React.cloneElement(panel.component, { key: panel.key }));

    }, [isDoctorLoggedIn, profile.enabledBiomarkers]);

    if (panelsToShow.length === 0 && !isDoctorLoggedIn) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No disease panels have been enabled by your doctor.</p>
                </CardContent>
            </Card>
        );
    }

    if (isDoctorLoggedIn) {
        return (
             <Card>
                <CardContent className="p-6 grid grid-cols-1 gap-6">
                    {panelsToShow}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-6 grid grid-cols-1 gap-6">
                {panelsToShow}
            </CardContent>
        </Card>
    );
}

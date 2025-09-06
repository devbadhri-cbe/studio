
'use client';

import { useApp } from '@/context/app-context';
import { DiabetesCard } from './diabetes-card';
import { HypertensionCard } from './hypertension-card';
import { Card, CardContent } from './ui/card';
import * as React from 'react';
import { LipidsPanel } from './lipids-panel';

const availablePanels = [
    { key: 'diabetes', component: <DiabetesCard /> },
    { key: 'hypertension', component: <HypertensionCard /> },
    { key: 'lipids', component: <LipidsPanel /> },
];

export function DiseasePanel() {
    const { isDoctorLoggedIn, profile } = useApp();

    const panelsToShow = React.useMemo(() => {
        if (isDoctorLoggedIn) {
            return availablePanels.map(p => p.component);
        }

        const enabledPanelKeys = Object.keys(profile.enabledBiomarkers || {});
        
        return availablePanels
            .filter(panel => enabledPanelKeys.includes(panel.key))
            .map(panel => panel.component);

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

    return (
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6">
                    {panelsToShow.map((PanelComponent, index) => (
                        <React.Fragment key={index}>
                            {PanelComponent}
                        </React.Fragment>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

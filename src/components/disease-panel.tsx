

'use client';

import { useApp } from '@/context/app-context';
import { Card, CardContent } from './ui/card';
import * as React from 'react';
import { availableDiseasePanels } from '@/lib/biomarker-cards';

export function DiseasePanel() {
    const { isDoctorLoggedIn, profile } = useApp();

    const panelsToShow = React.useMemo(() => {
        const enabledPanelKeys = Object.keys(profile.enabledBiomarkers || {});

        if (isDoctorLoggedIn) {
            const sortedPanels = [...availableDiseasePanels].sort((a, b) => {
                const aIsEnabled = enabledPanelKeys.includes(a.key);
                const bIsEnabled = enabledPanelKeys.includes(b.key);
                if (aIsEnabled && !bIsEnabled) return -1;
                if (!aIsEnabled && bIsEnabled) return 1;
                return a.label.localeCompare(b.label);
            });
            return sortedPanels.map(p => React.cloneElement(p.component, { key: p.key }));
        }
        
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

    return (
        <Card>
            <CardContent className="p-6 grid grid-cols-1 gap-6">
                {panelsToShow}
            </CardContent>
        </Card>
    );
}

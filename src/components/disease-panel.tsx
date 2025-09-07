

'use client';

import { useApp } from '@/context/app-context';
import { Card, CardContent } from './ui/card';
import * as React from 'react';
import { availableDiseasePanels } from '@/lib/biomarker-cards';
import { cn } from '@/lib/utils';

interface DiseasePanelProps {
    searchQuery?: string;
    isBiomarkersOpen?: boolean;
}

export function DiseasePanel({ searchQuery = '', isBiomarkersOpen }: DiseasePanelProps) {
    const { isDoctorLoggedIn, profile } = useApp();

    const panelsToShow = React.useMemo(() => {
        const enabledPanelKeys = Object.keys(profile.enabledBiomarkers || {});
        const lowercasedQuery = searchQuery.toLowerCase();
        
        const filteredPanels = availableDiseasePanels.filter(p => 
            searchQuery ? p.label.toLowerCase().includes(lowercasedQuery) : true
        );

        if (isDoctorLoggedIn) {
            const sortedPanels = [...filteredPanels].sort((a, b) => {
                const aIsEnabled = enabledPanelKeys.includes(a.key);
                const bIsEnabled = enabledPanelKeys.includes(b.key);
                if (aIsEnabled && !bIsEnabled) return -1;
                if (!aIsEnabled && bIsEnabled) return 1;
                return a.label.localeCompare(b.label);
            });
            return sortedPanels.map(p => React.cloneElement(p.component, { key: p.key }));
        }
        
        return filteredPanels
            .filter(panel => enabledPanelKeys.includes(panel.key))
            .map(panel => React.cloneElement(panel.component, { key: panel.key }));

    }, [isDoctorLoggedIn, profile.enabledBiomarkers, searchQuery]);

    if (panelsToShow.length === 0 && !isDoctorLoggedIn) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No disease panels have been enabled by your doctor.</p>
                </CardContent>
            </Card>
        );
    }
    
     if (panelsToShow.length === 0 && isDoctorLoggedIn) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p>No disease panels match your search.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className={cn(
                "p-6 grid grid-cols-1 gap-6 border-2 border-purple-500",
                !isBiomarkersOpen && "md:grid-cols-2"
            )}>
                {panelsToShow}
            </CardContent>
        </Card>
    );
}

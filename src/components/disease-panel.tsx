'use client';

import { useApp } from '@/context/app-context';
import { Card, CardContent } from './ui/card';
import * as React from 'react';
import { availableDiseasePanels } from '@/lib/biomarker-cards';

interface DiseasePanelProps {
    searchQuery?: string;
}

export function DiseasePanel({ searchQuery = '' }: DiseasePanelProps) {
    const { profile, isReadOnlyView } = useApp();

    const panelsToShow = React.useMemo(() => {
        if (!profile?.enabledBiomarkers) return [];

        const enabledPanelKeys = Object.keys(profile.enabledBiomarkers);
        const lowercasedQuery = searchQuery.toLowerCase();

        let panels = availableDiseasePanels;
        
        const filteredPanels = panels.filter(p => 
            searchQuery ? p.label.toLowerCase().includes(lowercasedQuery) : true
        );

        const sortedPanels = [...filteredPanels].sort((a, b) => {
            const aIsEnabled = enabledPanelKeys.includes(a.key);
            const bIsEnabled = enabledPanelKeys.includes(b.key);
            if (aIsEnabled && !bIsEnabled) return -1;
            if (!aIsEnabled && bIsEnabled) return 1;
            return a.label.localeCompare(b.label);
        });
        return sortedPanels.map(p => React.cloneElement(p.component, { key: p.key }));

    }, [profile?.enabledBiomarkers, searchQuery]);

    if (!profile) return null;
    
    if (panelsToShow.length === 0) {
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
            <CardContent className="p-6 grid grid-cols-1 gap-6">
                {panelsToShow}
            </CardContent>
        </Card>
    );
}

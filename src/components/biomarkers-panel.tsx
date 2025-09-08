

'use client';

import { useApp } from '@/context/app-context';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';
import { Card, CardContent } from './ui/card';
import * as React from 'react';
import { InteractivePanelGrid } from './interactive-panel-grid';

interface BiomarkersPanelProps {
    searchQuery?: string;
}

export function BiomarkersPanel({ searchQuery = '' }: BiomarkersPanelProps) {
    const { profile } = useApp();

    const enabledForPatient: (BiomarkerKey | string)[] = React.useMemo(() => {
        const allEnabled = Object.values(profile.enabledBiomarkers || {}).flat();
        return [...new Set(allEnabled)];
    }, [profile.enabledBiomarkers]);
    
    const allCards = Object.entries(availableBiomarkerCards).map(([key, value]) => ({
        key,
        label: value.label.toLowerCase(),
        component: React.cloneElement(value.component, { key, isReadOnly: false }),
    }));
    
    const sortedAndFilteredCards = React.useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = allCards.filter(card => 
            searchQuery ? card.label.includes(lowercasedQuery) : true
        );

        return filtered.sort((a, b) => {
            const aIsEnabled = enabledForPatient.includes(a.key);
            const bIsEnabled = enabledForPatient.includes(b.key);
            if (aIsEnabled && !bIsEnabled) return -1;
            if (!aIsEnabled && bIsEnabled) return 1;
            return a.label.localeCompare(b.label);
        });
    }, [allCards, enabledForPatient, searchQuery]);

    return (
        <Card>
            <CardContent className="p-4">
                 <InteractivePanelGrid>
                    {sortedAndFilteredCards.map(cardInfo => cardInfo.component)}
                </InteractivePanelGrid>
                {sortedAndFilteredCards.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        <p>No biomarker cards match your search.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

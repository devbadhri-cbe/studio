
'use client';

import { useApp } from '@/context/app-context';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';
import { Card, CardContent } from './ui/card';
import * as React from 'react';
import { InteractivePanelGrid } from './interactive-panel-grid';
import { CustomBiomarkerCard } from './custom-biomarker-card';

export function BiomarkersPanel() {
    const { isDoctorLoggedIn, profile } = useApp();

    const enabledForPatient: (BiomarkerKey | string)[] = React.useMemo(() => {
        const allEnabled = Object.values(profile.enabledBiomarkers || {}).flat();
        return [...new Set(allEnabled)];
    }, [profile.enabledBiomarkers]);
    
    const standardCards = Object.entries(availableBiomarkerCards).map(([key, value]) => ({
        key,
        component: React.cloneElement(value.component, { key, isReadOnly: !isDoctorLoggedIn }),
    }));
    
    const customCards = (profile.customBiomarkers || []).map(biomarker => ({
        key: biomarker.id,
        component: <CustomBiomarkerCard key={biomarker.id} biomarker={biomarker} isReadOnly={!isDoctorLoggedIn} />,
    }));

    const allCards = [...standardCards, ...customCards];

    if (isDoctorLoggedIn) {
        return (
            <Card>
                <CardContent className="p-4">
                     <InteractivePanelGrid>
                        {allCards.map(cardInfo => cardInfo.component)}
                    </InteractivePanelGrid>
                </CardContent>
            </Card>
        )
    }
    
    const cardsToShow = enabledForPatient
        .map(key => allCards.find(c => c.key === key)?.component)
        .filter(Boolean);

    return (
         <Card>
            <CardContent className="p-4">
                {cardsToShow.length > 0 ? (
                    <InteractivePanelGrid>
                        {cardsToShow}
                    </InteractivePanelGrid>
                ) : (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        <p>No biomarker cards have been enabled by your doctor yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

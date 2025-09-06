
'use client';

import { useApp } from '@/context/app-context';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';
import { BloodPressureCard } from './blood-pressure-card';
import { Card, CardContent } from './ui/card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { Hba1cCard } from './hba1c-card';
import { HemoglobinCard } from './hemoglobin-card';
import { ThyroidCard } from './thyroid-card';
import { VitaminDCard } from './vitamin-d-card';
import { WeightRecordCard } from './weight-record-card';
import * as React from 'react';

export function BiomarkersPanel() {
    const { isDoctorLoggedIn, profile } = useApp();

    const enabledForPatient: BiomarkerKey[] = React.useMemo(() => {
        if (!profile.enabledBiomarkers) return ['weight'];
        
        // Start with 'weight' as the default card.
        const defaultBiomarkers: BiomarkerKey[] = ['weight'];
        
        // Add all other biomarkers enabled by the doctor.
        const allEnabled = Object.values(profile.enabledBiomarkers).flat();
        
        // Combine and return unique keys, ensuring 'weight' is always present.
        return [...new Set([...defaultBiomarkers, ...allEnabled])];
    }, [profile.enabledBiomarkers]);
    
    if (isDoctorLoggedIn) {
        return (
            <Card>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Hba1cCard />
                    <FastingBloodGlucoseCard />
                    <HemoglobinCard />
                    <BloodPressureCard />
                    <ThyroidCard />
                    <VitaminDCard />
                    <WeightRecordCard />
                </CardContent>
            </Card>
        )
    }
    
    return (
         <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enabledForPatient.length > 0 ? (
                    enabledForPatient.map(key => {
                        const cardInfo = availableBiomarkerCards[key];
                        return cardInfo ? React.cloneElement(cardInfo.component, { key }) : null;
                    })
                ) : (
                    <div className="col-span-full text-center text-muted-foreground py-12">
                        <p>No biomarker cards have been enabled by your doctor yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

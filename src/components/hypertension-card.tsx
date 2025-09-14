
'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { BloodPressureCard } from './blood-pressure-card';
import { cn } from '@/lib/utils';
import { DiseaseCardLayout } from './disease-card-layout';

export function HypertensionCard() {
    return (
        <DiseaseCardLayout
            title="Hypertension Card"
            icon={<Heart className="h-6 w-6 text-primary" />}
        >
            <div className={cn("grid grid-cols-1 gap-6 transition-all")}>
                <BloodPressureCard isReadOnly />
            </div>
        </DiseaseCardLayout>
    );
}

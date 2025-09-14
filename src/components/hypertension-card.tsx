
'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { BloodPressureCard } from './blood-pressure-card';
import { cn } from '@/lib/utils';
import { DiseaseCardLayout } from './disease-card-layout';

export function HypertensionCard() {
    return (
        <DiseaseCardLayout
            value="hypertension"
            title="Hypertension Card"
            icon={<Heart className="h-6 w-6 text-primary" />}
        >
            <BloodPressureCard isReadOnly />
        </DiseaseCardLayout>
    );
}

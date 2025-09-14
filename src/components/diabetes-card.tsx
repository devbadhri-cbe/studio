
'use client';

import * as React from 'react';
import { Droplet } from 'lucide-react';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { cn } from '@/lib/utils';
import { DiseaseCardLayout } from './disease-card-layout';

export function DiabetesCard() {
    return (
        <DiseaseCardLayout
            value="diabetes"
            title="Diabetes Card"
            icon={<Droplet className="h-6 w-6 text-primary" />}
        >
            <Hba1cCard isReadOnly />
            <FastingBloodGlucoseCard isReadOnly />
        </DiseaseCardLayout>
    );
}

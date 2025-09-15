
'use client';

import * as React from 'react';
import { HeartCrack } from 'lucide-react'; // Using HeartCrack as a placeholder
import { HemoglobinCard } from './hemoglobin-card';
import { StandaloneDiseaseCardLayout } from './standalone-disease-card-layout';

export function AnemiaCard() {
    return (
        <StandaloneDiseaseCardLayout
            value="anemia"
            title="Anemia Card"
            subtitle="Check your hemoglobin levels"
            icon={<HeartCrack className="h-6 w-6 text-primary" />}
        >
            <HemoglobinCard key="hemoglobin" isReadOnly />
        </StandaloneDiseaseCardLayout>
    );
}

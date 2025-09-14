
'use client';

import * as React from 'react';
import { HeartCrack } from 'lucide-react'; // Using HeartCrack as a placeholder
import { HemoglobinCard } from './hemoglobin-card';
import { cn } from '@/lib/utils';
import { DiseaseCardLayout } from './disease-card-layout';

export function AnemiaCard() {
    return (
        <DiseaseCardLayout
            value="anemia"
            title="Anemia Card"
            icon={<HeartCrack className="h-6 w-6 text-primary" />}
            isSingleAction={true}
        >
            <HemoglobinCard isReadOnly />
        </DiseaseCardLayout>
    );
}

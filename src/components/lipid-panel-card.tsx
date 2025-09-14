
'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TotalCholesterolCard } from './total-cholesterol-card';
import { LdlCard } from './ldl-card';
import { HdlCard } from './hdl-card';
import { TriglyceridesCard } from './triglycerides-card';
import { DiseaseCardLayout } from './disease-card-layout';


export function LipidPanelCard() {
    return (
        <DiseaseCardLayout
            value="lipidPanel"
            title="Lipid Card"
            icon={<Flame className="h-6 w-6 text-primary" />}
            isSingleAction={true}
        >
            <TotalCholesterolCard key="totalCholesterol" isReadOnly={true} />
            <LdlCard key="ldl" isReadOnly={true} />
            <HdlCard key="hdl" isReadOnly={true} />
            <TriglyceridesCard key="triglycerides" isReadOnly={true} />
        </DiseaseCardLayout>
    );
}

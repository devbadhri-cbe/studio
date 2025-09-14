
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
            title="Lipid Card"
            icon={<Flame className="h-6 w-6 text-primary" />}
        >
            <div className={cn(
                "grid grid-cols-1 gap-6 transition-all",
                "md:grid-cols-2"
            )}>
                <TotalCholesterolCard isReadOnly={true} />
                <LdlCard isReadOnly={true} />
                <HdlCard isReadOnly={true} />
                <TriglyceridesCard isReadOnly={true} />
            </div>
        </DiseaseCardLayout>
    );
}

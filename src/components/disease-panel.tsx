
'use client';

import { DiabetesCard } from './diabetes-card';
import { HypertensionCard } from './hypertension-card';
import { Card, CardContent } from './ui/card';


export function DiseasePanel() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            <DiabetesCard />
            <HypertensionCard />
        </div>
    );
}

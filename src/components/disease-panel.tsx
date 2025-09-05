
'use client';

import { DiabetesCard } from './diabetes-card';
import { HypertensionCard } from './hypertension-card';
import { Card, CardContent } from './ui/card';


export function DiseasePanel() {
    return (
        <Card>
            <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
               <DiabetesCard />
               <HypertensionCard />
            </CardContent>
        </Card>
    );
}

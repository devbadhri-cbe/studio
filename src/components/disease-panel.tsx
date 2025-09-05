
'use client';

import { DiabetesCard } from './diabetes-card';
import { HypertensionCard } from './hypertension-card';
import { Card, CardContent } from './ui/card';

export function DiseasePanel() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6">
                    <DiabetesCard />
                    <HypertensionCard />
                </div>
            </CardContent>
        </Card>
    );
}

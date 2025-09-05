
'use client';

import { WeightRecordCard } from './weight-record-card';
import { BloodPressureCard } from './blood-pressure-card';
import { VitaminDCard } from './vitamin-d-card';
import { ThyroidCard } from './thyroid-card';
import { RenalCard } from './renal-card';
import { Card, CardContent } from './ui/card';

export function BiomarkersPanel() {
    return (
        <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeightRecordCard />
                <BloodPressureCard />
                <VitaminDCard />
                <ThyroidCard />
                <RenalCard />
            </CardContent>
        </Card>
    )
}

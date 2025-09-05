
'use client';

import { BloodPressureCard } from './blood-pressure-card';
import { Card, CardContent } from './ui/card';
import { ThyroidCard } from './thyroid-card';
import { VitaminDCard } from './vitamin-d-card';
import { WeightRecordCard } from './weight-record-card';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { HemoglobinCard } from './hemoglobin-card';

export function BiomarkersPanel() {
    return (
        <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Hba1cCard />
                <FastingBloodGlucoseCard />
                <HemoglobinCard />
                <BloodPressureCard />
                <ThyroidCard />
                <VitaminDCard />
                <WeightRecordCard />
            </CardContent>
        </Card>
    )
}

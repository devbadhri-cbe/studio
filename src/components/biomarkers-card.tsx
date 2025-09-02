

'use client';

import * as React from 'react';
import { WeightRecordCard } from './weight-record-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shapes } from 'lucide-react';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { Separator } from './ui/separator';

export function BiomarkersCard() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3">
                <Shapes className="h-5 w-5 shrink-0 text-muted-foreground" />
                <CardTitle>Key Biomarkers</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <WeightRecordCard />
                <Separator />
                <FastingBloodGlucoseCard />
            </CardContent>
        </Card>
    );
}

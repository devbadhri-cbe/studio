

'use client';

import * as React from 'react';
import { WeightRecordCard } from './weight-record-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shapes } from 'lucide-react';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { AnemiaCard } from './anemia-card';
import { useApp } from '@/context/app-context';

export function BiomarkersCard() {
  const { profile } = useApp();

  const biomarkerCards = [
    { key: 'weight', component: <WeightRecordCard /> },
    { key: 'glucose', component: <FastingBloodGlucoseCard /> },
    { key: 'anemia', component: <AnemiaCard /> },
  ];

  if (biomarkerCards.length === 0) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col md:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shapes className="h-5 w-5 shrink-0 text-muted-foreground" />
          <CardTitle>Key Biomarkers</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1">
        <div className="flex flex-col gap-4 border border-red-500 p-4 rounded-lg aspect-[4/3]">
          {biomarkerCards.map((card) => (
            <React.Fragment key={card.key}>
              {card.component}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

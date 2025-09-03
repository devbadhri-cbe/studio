
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shapes, Settings } from 'lucide-react';
import { WeightRecordCard } from './weight-record-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { HemoglobinCard } from './hemoglobin-card';
import { Hba1cCard } from './hba1c-card';

const biomarkerCards = {
  weight: {
    label: 'Weight & BMI',
    component: <WeightRecordCard />,
  },
  glucose: {
    label: 'Fasting Blood Glucose',
    component: <FastingBloodGlucoseCard />,
  },
  anemia: {
    label: 'Hemoglobin',
    component: <HemoglobinCard />,
  },
  hba1c: {
    label: 'HbA1c',
    component: <Hba1cCard />,
  },
};

type BiomarkerKey = keyof typeof biomarkerCards;

export function BiomarkersCard() {
  const [activeView, setActiveView] = React.useState<BiomarkerKey>('weight');
  const availableBiomarkerOptions = Object.keys(biomarkerCards) as BiomarkerKey[];

  React.useEffect(() => {
    if (!availableBiomarkerOptions.includes(activeView)) {
      setActiveView(availableBiomarkerOptions[0] || 'weight');
    }
  }, [activeView, availableBiomarkerOptions]);

  if (availableBiomarkerOptions.length === 0) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col md:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <Shapes className="h-5 w-5 shrink-0 text-muted-foreground" />
            <CardTitle>Key Biomarkers</CardTitle>
            </div>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                value={activeView}
                onValueChange={(value) => setActiveView(value as BiomarkerKey)}
                >
                {availableBiomarkerOptions.map((key) => (
                    <DropdownMenuRadioItem key={key} value={key}>
                    {biomarkerCards[key].label}
                    </DropdownMenuRadioItem>
                ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col rounded-lg md:aspect-[4/3] shadow-xl">
          {biomarkerCards[activeView]?.component}
        </div>
      </CardContent>
    </Card>
  );
}

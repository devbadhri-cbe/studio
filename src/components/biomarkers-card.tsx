

'use client';

import * as React from 'react';
import { WeightRecordCard } from './weight-record-card';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shapes, Settings } from 'lucide-react';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { AnemiaCard } from './anemia-card';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ActiveView = 'weight' | 'glucose' | 'anemia';

export function BiomarkersCard() {
    const [activeView, setActiveView] = React.useState<ActiveView>('weight');

    const renderActiveCard = () => {
        switch (activeView) {
            case 'glucose':
                return <FastingBloodGlucoseCard />;
            case 'anemia':
                return <AnemiaCard />;
            case 'weight':
            default:
                return <WeightRecordCard />;
        }
    }

    return (
        <Card className="h-auto md:row-span-2 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Shapes className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <CardTitle>Key Biomarkers</CardTitle>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>Select View</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)}>
                            <DropdownMenuRadioItem value="weight">Weight & BMI</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="glucose">Fasting Blood Glucose</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="anemia">Hemoglobin</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 flex flex-col">
               {renderActiveCard()}
            </CardContent>
        </Card>
    );
}

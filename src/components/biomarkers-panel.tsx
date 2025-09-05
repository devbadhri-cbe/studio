
'use client';

import { DropletIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { WeightRecordCard } from './weight-record-card';
import { BloodPressureCard } from './blood-pressure-card';
import { DiabetesCard } from './diabetes-card';
import { LipidCard } from './lipid-card';
import { VitaminDCard } from './vitamin-d-card';
import { ThyroidCard } from './thyroid-card';
import { RenalCard } from './renal-card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

export function BiomarkersPanel() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                    <DropletIcon className="mr-2 h-4 w-4" />
                    Biomarker cards
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[500px] p-0">
                 <SheetHeader className="p-6 border-b">
                    <SheetTitle>All Biomarkers</SheetTitle>
                    <SheetDescription>A consolidated view of all patient biomarker data.</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)]">
                    <div className="p-6 space-y-6">
                        <WeightRecordCard />
                        <Separator />
                        <BloodPressureCard />
                        <Separator />
                        <DiabetesCard />
                        <Separator />
                        <LipidCard />
                        <Separator />
                        <VitaminDCard />
                        <Separator />
                        <ThyroidCard />
                        <Separator />
                        <RenalCard />
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}

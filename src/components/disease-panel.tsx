
'use client';

import { Stethoscope } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { MedicalHistoryCard } from './medical-history-card';
import { DoctorReviewCard } from './doctor-review-card';

export function DiseasePanel() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Disease Panel
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[500px]">
                <SheetHeader>
                    <SheetTitle>Disease & Medication Overview</SheetTitle>
                    <SheetDescription>Manage conditions and review patient-added information.</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <DoctorReviewCard />
                    <MedicalHistoryCard />
                </div>
            </SheetContent>
        </Sheet>
    )
}

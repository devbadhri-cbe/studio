
'use client';

import { Card } from './ui/card';
import { MedicalHistoryCard } from './medical-history-card';
import { DoctorReviewCard } from './doctor-review-card';

export function DiseasePanel() {
    return (
        <Card className="p-4 space-y-4">
            <DoctorReviewCard />
            <MedicalHistoryCard />
        </Card>
    );
}

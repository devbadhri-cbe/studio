
'use client';

import { DiabetesCard } from './diabetes-card';
import { HypertensionCard } from './hypertension-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from './ui/card';

export function DiseasePanel() {
    return (
        <Card>
            <ScrollArea className="h-[550px] p-6">
                <div className="grid grid-cols-1 gap-6">
                    <DiabetesCard />
                    <HypertensionCard />
                </div>
            </ScrollArea>
        </Card>
    );
}

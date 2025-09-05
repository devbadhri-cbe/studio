
'use client';

import { BloodPressureCard } from './blood-pressure-card';
import { Heart } from 'lucide-react';
import { DiseasePanelCard } from './disease-panel-card';


export function HypertensionCard() {
  const icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;
  return (
    <DiseasePanelCard title="Hypertension Panel" icon={icon}>
        <div className="flex flex-wrap gap-4 border-2 border-blue-500">
            <BloodPressureCard />
        </div>
    </DiseasePanelCard>
  );
}

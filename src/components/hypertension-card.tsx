
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BloodPressureCard } from './blood-pressure-card';
import { Heart } from 'lucide-react';


export function HypertensionCard() {
  return (
    <Card className="h-full">
        <CardContent className="p-4 space-y-4">
             <div className="flex items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Hypertension Panel</h3>
                </div>
             </div>
             
            <div className="grid grid-cols-1 gap-4">
                <BloodPressureCard />
            </div>
        </CardContent>
    </Card>
  );
}

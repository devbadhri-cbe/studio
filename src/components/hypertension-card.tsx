
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BloodPressureCard } from './blood-pressure-card';
import { Heart } from 'lucide-react';


export function HypertensionCard() {
  return (
    <Card className="h-full shadow-xl border-2 border-blue-500">
        <CardHeader>
             <div className="flex items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <CardTitle className="text-base font-semibold">Hypertension Panel</CardTitle>
                </div>
             </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <BloodPressureCard />
            </div>
        </CardContent>
    </Card>
  );
}

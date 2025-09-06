
'use client';

import * as React from 'react';
import { Flame } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';

// This is a placeholder for a future implementation of a detailed Lipid Panel card.
export function LipidCard() {
  const { isDoctorLoggedIn } = useApp();

  return (
    <Card className="h-full shadow-xl">
        <CardHeader>
            <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 shrink-0 text-muted-foreground" />
                <CardTitle>Lipid Panel</CardTitle>
            </div>
            <CardDescription>
                Comprehensive lipid profile including cholesterol and triglycerides.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-4 min-h-[200px]">
                <p className="text-sm">This panel is not yet fully implemented.</p>
                <p className="text-xs">Detailed charts and record entry for LDL, HDL, and Triglycerides will be available soon.</p>
            </div>
        </CardContent>
    </Card>
  );
}

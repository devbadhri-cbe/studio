
'use client';

import * as React from 'react';
import { LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function BiomarkersCard() {
  return (
    <Card className="h-full">
        <CardContent className="p-4 space-y-4">
             <div className="flex items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    <LayoutGrid className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Biomarkers</h3>
                </div>
             </div>
             
             <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                <p className="text-center text-xs text-muted-foreground">Individual biomarker cards will be shown here.</p>
            </div>

        </CardContent>
    </Card>
  );
}


'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TestTubeDiagonal } from 'lucide-react';

export function BiomarkersCard() {
    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    <TestTubeDiagonal className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Key Biomarkers</h3>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                    <p className="text-center text-xs text-muted-foreground">Biomarker cards will be displayed here.</p>
                </div>
            </CardContent>
        </Card>
    );
}

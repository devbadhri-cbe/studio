
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from './ui/separator';

interface BiomarkerCardTemplateProps {
  title: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  recordsList: React.ReactNode;
  statusDisplay: React.ReactNode;
  chart: React.ReactNode;
}

export function BiomarkerCardTemplate({
  title,
  icon,
  actions,
  recordsList,
  statusDisplay,
  chart,
}: BiomarkerCardTemplateProps) {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardContent className="flex flex-col h-full text-sm p-4 space-y-4">
        {/* 1. Heading with action button */}
        <div className="flex items-center justify-between">
           <div className='flex items-center gap-3 flex-1'>
             {icon}
             <h3 className="font-medium">{title}</h3>
           </div>
          <div className="flex items-center gap-1 shrink-0">
            {actions}
          </div>
        </div>

        {/* 2. Records and Status horizontally */}
        <div className="flex flex-row items-start gap-4">
          <div className="flex-1">
              {recordsList}
          </div>
          <div className="flex-1 flex items-center justify-center h-full">
              {statusDisplay}
          </div>
        </div>
        
        {/* Separator before the chart */}
        <Separator />

        {/* 3. Chart in the bottom */}
        <div className="flex-1 flex flex-col min-h-[150px]">
            {chart}
        </div>
      </CardContent>
    </Card>
  );
}

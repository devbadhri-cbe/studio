
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="w-full h-full">
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

        {/* 2. Records and Status in a horizontal grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="border rounded-md p-2 min-h-[140px]">
            {recordsList}
          </div>
          <div className="border rounded-md p-2 flex items-center justify-center min-h-[140px]">
            {statusDisplay}
          </div>
        </div>
        
        {/* 3. Chart in the bottom, expanding to fill space */}
        <div className="border rounded-md p-2 flex-1 flex flex-col">
            {chart}
        </div>
      </CardContent>
    </Card>
  );
}

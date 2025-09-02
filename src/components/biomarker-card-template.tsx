
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BiomarkerCardTemplateProps {
  title: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  recordsList: React.ReactNode;
  statusDisplay: React.ReactNode;
  chart: React.ReactNode;
  className?: string;
}

export function BiomarkerCardTemplate({
  title,
  icon,
  actions,
  recordsList,
  statusDisplay,
  chart,
  className
}: BiomarkerCardTemplateProps) {
  return (
    <Card className={cn("w-full flex flex-col h-full", className)}>
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
        <div className="flex border rounded-md flex-1 min-h-0">
          <div className="flex-1 border-r rounded-l-md p-2 flex items-center justify-center">
            {recordsList}
          </div>
          <div className="flex-1 p-2 flex items-center justify-center">
            {statusDisplay}
          </div>
        </div>
        
        {/* 3. Chart in the bottom, expanding to fill space */}
        <div className="border rounded-md p-2 flex-1 flex flex-col min-h-0">
            {chart}
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface BiomarkerCardTemplateProps {
  title: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  recordsList: React.ReactNode;
  statusDisplay: React.ReactNode;
  chart: React.ReactNode;
  className?: string;
  hasRecords: boolean;
  noRecordsMessage?: string;
}

export function BiomarkerCardTemplate({
  title,
  icon,
  actions,
  recordsList,
  statusDisplay,
  chart,
  className,
  hasRecords,
  noRecordsMessage = "No records yet."
}: BiomarkerCardTemplateProps) {
  return (
    <Card className={cn("w-full flex flex-col h-full shadow-xl border-primary", className)}>
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

        {hasRecords ? (
          <div className="flex-1 flex flex-col min-h-0">
              {/* Top Section: Records & Status */}
              <div className="flex flex-col md:flex-row gap-4 min-h-[120px] items-center">
                  <div className="flex-1 w-full p-2 flex items-center justify-center">
                      {recordsList}
                  </div>
                  <div className="flex-1 w-full p-2 flex items-center justify-center">
                      {statusDisplay}
                  </div>
              </div>
              
              <Separator />

              {/* Bottom Section: Chart */}
              <div className="pt-4 flex-1 h-[250px] w-full">
                  {chart}
              </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4 min-h-[200px]">
              <p className="text-sm">{noRecordsMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

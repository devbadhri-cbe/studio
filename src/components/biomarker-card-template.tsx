
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
    <Card className="w-full h-full">
      <CardContent className="flex flex-col h-full text-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
           <div className='flex items-center gap-3 flex-1'>
             {icon}
             <h3 className="font-medium">{title}</h3>
           </div>
          <div className="flex items-center gap-1 shrink-0">
            {actions}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row md:gap-4">
            {/* Left Column (Records & Status) */}
            <div className="flex flex-col md:w-1/3 space-y-4">
                 <div className="flex flex-row items-stretch gap-4">
                    <div className="flex-1">
                        {recordsList}
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        {statusDisplay}
                    </div>
                </div>
                <Separator className="md:hidden" />
            </div>
            {/* Right Column (Chart) */}
            <div className="flex-1 flex flex-col min-h-[150px] pt-2 md:pt-0">
                {chart}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

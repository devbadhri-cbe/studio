
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
    <Card>
      <CardContent className="flex flex-col flex-1 text-sm p-4 space-y-4 h-full">
        <div className="flex items-center justify-between mb-2">
           <div className='flex items-center gap-3 flex-1'>
             {icon}
             <h3 className="font-medium">{title}</h3>
           </div>
          <div className="flex items-center gap-1 shrink-0">
            {actions}
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex flex-row">
            <div className="flex flex-col flex-1 pr-3">
              {recordsList}
            </div>
             <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 flex-1">
                {statusDisplay}
             </div>
          </div>
          <div className="flex flex-col flex-1 min-h-[150px]">
            {chart}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

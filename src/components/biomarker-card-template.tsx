
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BiomarkerCardTemplateProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
  recordsList: React.ReactNode;
  statusDisplay: React.ReactNode;
  chart: React.ReactNode;
}

export function BiomarkerCardTemplate({
  title,
  actions,
  recordsList,
  statusDisplay,
  chart,
}: BiomarkerCardTemplateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col flex-1 text-sm p-4 space-y-4 h-full">
        <div className="flex items-center justify-between mb-2">
          {title}
          <div className="flex items-center gap-1 shrink-0">
            {actions}
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex flex-row">
            <div className="flex flex-col flex-1 pr-3">
              {recordsList}
            </div>
            {statusDisplay}
          </div>
          <div className="flex flex-col flex-1 min-h-[150px]">
            {chart}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { InteractivePanelGrid } from './interactive-panel-grid';

interface DiseasePanelCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function DiseasePanelCard({ title, icon, children, className, actions }: DiseasePanelCardProps) {
  return (
    <Card className={cn("h-full shadow-xl flex flex-col", className)}>
        <div className="flex flex-col flex-1 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    {icon}
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                </div>
                 {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
            </div>
            <CardContent className="p-0 flex-1 flex flex-col">
                <InteractivePanelGrid>
                    {children}
                </InteractivePanelGrid>
            </CardContent>
        </div>
    </Card>
  );
}

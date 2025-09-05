
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DiseasePanelCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DiseasePanelCard({ title, icon, children, className }: DiseasePanelCardProps) {
  return (
    <Card className={cn("h-full shadow-xl flex flex-col", className)}>
        <div className="border-2 border-purple-500 flex flex-col flex-1 p-4 space-y-4">
            <div className="flex items-center justify-between border-2 border-green-500">
                <div className='flex items-center gap-3 flex-1'>
                    {icon}
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                </div>
            </div>
            <CardContent className="p-0 flex flex-col">
                {children}
            </CardContent>
        </div>
    </Card>
  );
}

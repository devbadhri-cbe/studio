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
    <Card className={cn("h-full shadow-xl border-2 border-green-500", className)}>
        <CardHeader>
             <div className="flex items-center justify-between border-2 border-red-500">
                <div className='flex items-center gap-3 flex-1'>
                    {icon}
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                </div>
             </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
            {children}
        </CardContent>
    </Card>
  );
}

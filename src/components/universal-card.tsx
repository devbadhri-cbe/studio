
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface UniversalCardProps {
  headerContent?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export function UniversalCard({
  headerContent,
  actions,
  children,
  className,
  contentClassName,
  headerClassName,
}: UniversalCardProps) {
  return (
    <Card className={cn("w-full flex flex-col h-full shadow-xl border-accent", className)}>
      {(headerContent || actions) && (
        <CardHeader className={cn(headerClassName)}>
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">{headerContent}</div>
                 {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
            </div>
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 flex flex-col p-6 pt-0", contentClassName)}>
         {headerContent && <Separator className="mb-6" />}
        {children}
      </CardContent>
    </Card>
  );
}

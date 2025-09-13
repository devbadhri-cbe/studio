
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface UniversalCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function UniversalCard({
  title,
  description,
  icon,
  actions,
  children,
  className,
  contentClassName,
}: UniversalCardProps) {
  return (
    <Card className={cn("w-full flex flex-col h-full shadow-xl", className)}>
      {(title || description || icon) && (
        <CardHeader>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            {icon}
                        </div>
                    )}
                    <div>
                        {title && <CardTitle>{title}</CardTitle>}
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                </div>
                 {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
            </div>
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 flex flex-col p-6 pt-0", contentClassName)}>
         {(title || description || icon) && <Separator className="mb-6" />}
        {children}
      </CardContent>
    </Card>
  );
}

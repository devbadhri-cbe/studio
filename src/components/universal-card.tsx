
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <Card className={cn("w-full flex flex-col h-full shadow-md", className)}>
      {(title || description || icon || actions) && (
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("flex-1 flex flex-col", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

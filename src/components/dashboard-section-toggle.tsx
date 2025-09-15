
'use client';

import * as React from 'react';
import { CollapsibleTrigger, Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Separator } from './ui/separator';

interface DashboardSectionToggleProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function DashboardSectionToggle({
  title,
  subtitle,
  icon,
  isOpen,
  onOpenChange,
  children,
  actions,
}: DashboardSectionToggleProps) {
  
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <CollapsibleTrigger className="flex items-center flex-1 gap-4 text-left">
                        <div className="flex-shrink-0">{icon}</div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                        </div>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                        {actions}
                        <CollapsibleTrigger>
                             <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground", isOpen && "rotate-180")} />
                        </CollapsibleTrigger>
                    </div>
                </div>
            </CardHeader>
            <CollapsibleContent>
                <div className="px-6 pb-6">
                    <Separator className="mb-6" />
                    {children}
                </div>
            </CollapsibleContent>
        </Card>
    </Collapsible>
  );
}

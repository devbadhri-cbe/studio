
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface DashboardSectionToggleProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  children: React.ReactNode;
}

export function DashboardSectionToggle({ title, icon, isOpen, children }: DashboardSectionToggleProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-3">
        <div className="flex items-center gap-3 flex-1">
            {icon}
            <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
            {isOpen && children}
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
        </div>
    </div>
  );
}

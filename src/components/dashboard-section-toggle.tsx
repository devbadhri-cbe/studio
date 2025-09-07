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
    <div className="flex gap-2">
      <CollapsibleTrigger asChild>
        <Button
          variant={isOpen ? 'default' : 'outline'}
          className={cn("w-full justify-start py-6 text-base", isOpen && "shadow-lg")}
        >
          {icon}
          <span className="ml-2">{title}</span>
          <ChevronDown className={cn("ml-auto h-5 w-5 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      {isOpen && children}
    </div>
  );
}

'use client';

import * as React from 'react';
import { UniversalCard } from './universal-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface DiseaseCardLayoutProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function DiseaseCardLayout({ title, icon, children }: DiseaseCardLayoutProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <UniversalCard
        icon={icon}
        title={title}
        actions={
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
        }
      >
        <CollapsibleContent>
          {children}
        </CollapsibleContent>
      </UniversalCard>
    </Collapsible>
  );
}

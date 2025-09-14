
'use client';

import * as React from 'react';
import { UniversalCard } from './universal-card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardDescription, CardTitle } from './ui/card';


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
        headerContent={
          <CollapsibleTrigger className="flex items-center gap-3 text-left w-full cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  {icon}
              </div>
              <div className="flex-1">
                  <CardTitle>{title}</CardTitle>
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform text-muted-foreground mr-2", isOpen && "rotate-180")} />
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

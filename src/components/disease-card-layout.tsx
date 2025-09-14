
'use client';

import * as React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardDescription, CardTitle } from './ui/card';
import { UniversalCard } from './universal-card';
import { Separator } from './ui/separator';

interface DiseaseCardLayoutProps {
  value: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function DiseaseCardLayout({ value, title, icon, children }: DiseaseCardLayoutProps) {
  return (
    <AccordionItem value={value}>
        <AccordionTrigger>
             <div className="flex items-center gap-3 text-left w-full cursor-pointer p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {icon}
                </div>
                <div className="flex-1">
                    <CardTitle>{title}</CardTitle>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
            <div className="p-6 pt-0">
                 <Separator className="mb-6" />
                {children}
            </div>
        </AccordionContent>
    </AccordionItem>
  );
}

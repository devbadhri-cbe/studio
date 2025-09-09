
'use client';

import * as React from 'react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from './ui/input';
import { BiomarkerCardTemplate } from './biomarker-card-template';

interface DashboardSectionToggleProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
}

export function DashboardSectionToggle({ 
  title, 
  subtitle,
  icon, 
  isOpen,
  searchQuery,
  onSearchChange,
  searchPlaceholder
}: DashboardSectionToggleProps) {

  const content = (
      <div className="flex flex-col md:flex-row items-start md:items-center w-full gap-4">
        <CollapsibleTrigger asChild>
            <div className="flex-1 flex items-center gap-4 cursor-pointer">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
            </div>
        </CollapsibleTrigger>
        
        <div className="flex items-center justify-end gap-2 w-full md:w-auto">
             {isOpen && (
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-8 h-9 w-full md:w-48"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
             <CollapsibleTrigger asChild>
                <ChevronDown className={cn("h-5 w-5 transition-transform cursor-pointer", isOpen && "rotate-180")} />
            </CollapsibleTrigger>
        </div>
      </div>
  );

  return (
    <div role="button" className="hover:bg-muted/50 transition-colors rounded-lg">
    <BiomarkerCardTemplate
        title=""
        icon={icon}
        hasRecords={true}
        records={[]}
        onDeleteRecord={() => {}}
        statusDisplay={<></>}
        chart={<></>}
        className="shadow-xl"
    >
        {content}
    </BiomarkerCardTemplate>
    </div>
  );
}


'use client';

import * as React from 'react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, PlusCircle } from 'lucide-react';
import { Input } from './ui/input';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { Button } from './ui/button';

interface DashboardSectionToggleProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  isCollapsible?: boolean;
}

export function DashboardSectionToggle({ 
  title, 
  subtitle,
  icon, 
  isOpen,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  showCreateButton = false,
  onCreateClick,
  isCollapsible = true,
}: DashboardSectionToggleProps) {

  const content = (
      <div className="flex flex-col md:flex-row items-start md:items-center w-full gap-4">
        <div className="flex-1 flex items-center gap-4 cursor-pointer">
            <div className="flex-1">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
        </div>
        
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
             {isCollapsible && <ChevronDown className={cn("h-5 w-5 transition-transform cursor-pointer", isOpen && "rotate-180")} />}
        </div>
      </div>
  );
  
  const Wrapper = isCollapsible ? CollapsibleTrigger : 'div';

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
        <Wrapper className={cn("w-full", isCollapsible && "block")}>
            {content}
        </Wrapper>
    </BiomarkerCardTemplate>
    </div>
  );
}

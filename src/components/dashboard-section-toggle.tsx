
'use client';

import * as React from 'react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, PlusCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
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
  const TriggerWrapper = isCollapsible ? CollapsibleTrigger : 'div';

  return (
    <Card role="button" className="hover:bg-muted/50 transition-colors shadow-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between w-full gap-4">
          <TriggerWrapper className={cn("flex items-center flex-1 gap-4 text-left", isCollapsible && "cursor-pointer")}>
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {isCollapsible && <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />}
          </TriggerWrapper>
          
          <div className="flex items-center justify-end gap-2 shrink-0">
            {isOpen && showCreateButton && (
              <Button variant="outline" size="sm" onClick={onCreateClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create
              </Button>
            )}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

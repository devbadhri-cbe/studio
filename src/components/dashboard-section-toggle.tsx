
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
  
  const content = (
    <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
          <div className="flex items-center flex-1 gap-4 text-left">
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
             {isCollapsible && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
          
          <div className="flex items-center justify-end gap-2 shrink-0 w-full md:w-auto">
            {isOpen && showCreateButton && (
              <Button variant="outline" size="sm" onClick={onCreateClick} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create
              </Button>
            )}
            {isOpen && (
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-8 h-9 w-full"
                />
              </div>
            )}
              {isCollapsible && (
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
              )}
          </div>
        </div>
      </CardContent>
  );

  const triggerContent = (
     <div className="w-full" role="button">
        {content}
     </div>
  )

  return (
    <Card className="hover:bg-muted/50 transition-colors shadow-sm">
      {isCollapsible ? <CollapsibleTrigger asChild>{triggerContent}</CollapsibleTrigger> : <div onClick={onCreateClick}>{content}</div> }
    </Card>
  );
}

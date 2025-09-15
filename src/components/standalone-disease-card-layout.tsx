
'use client';

import * as React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { CollapsibleTrigger, CollapsibleContent, Collapsible } from '@/components/ui/collapsible';
import { Separator } from './ui/separator';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { availableBiomarkerCards } from '@/lib/biomarker-cards';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { ActionIcon } from './ui/action-icon';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface StandaloneDiseaseCardLayoutProps {
  value: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isSingleAction?: boolean;
}

export function StandaloneDiseaseCardLayout({ value, title, subtitle, icon, children, isSingleAction = false }: StandaloneDiseaseCardLayoutProps) {
  const [activeDialogKey, setActiveDialogKey] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const validChildren = React.Children.toArray(children).filter(React.isValidElement);

  const addRecordMenuItems = validChildren.map(child => {
    const biomarkerKey = child.key as string;
    if (!biomarkerKey || !availableBiomarkerCards[biomarkerKey]) return null;

    const { addRecordLabel } = availableBiomarkerCards[biomarkerKey];
    return (
      <DropdownMenuItem key={biomarkerKey} onSelect={() => setActiveDialogKey(biomarkerKey)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {addRecordLabel}
      </DropdownMenuItem>
    );
  }).filter(Boolean);

  const renderActiveDialog = () => {
    const dialogKey = isSingleAction ? value : activeDialogKey;
    if (!dialogKey) return null;
    
    const dialogElement = availableBiomarkerCards[dialogKey as keyof typeof availableBiomarkerCards]?.addRecordDialog;
    if (!dialogElement) return null;

    return React.cloneElement(dialogElement, {
      onCancel: () => setActiveDialogKey(null),
    });
  };

  let Actions;
  if (isSingleAction) {
    Actions = (
      <ActionIcon 
        tooltip="Add New Record"
        icon={<PlusCircle className="h-4 w-4" />}
        onClick={(e) => {
            e.stopPropagation();
            setActiveDialogKey(value);
        }}
       />
    )
  } else if (addRecordMenuItems.length > 0) {
      Actions = (
        <ActionMenu tooltip="Add New Record" icon={<PlusCircle className="h-4 w-4" />}>
            {addRecordMenuItems}
        </ActionMenu>
      )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border rounded-lg shadow-sm overflow-hidden">
            <CollapsibleTrigger className="w-full">
                 <CardHeader className="p-6 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between text-left w-full">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                {icon}
                            </div>
                            <div>
                                <CardTitle>{title}</CardTitle>
                                {subtitle && <CardDescription className="mt-1">{subtitle}</CardDescription>}
                            </div>
                        </div>
                        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground", isOpen && "rotate-180")} />
                    </div>
                </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="px-6 pb-6">
                    <Separator className="mb-6" />
                    {activeDialogKey ? (
                        renderActiveDialog()
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                {Actions}
                            </div>
                            {children}
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Card>
    </Collapsible>
  );
}

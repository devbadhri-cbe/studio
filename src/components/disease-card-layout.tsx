
'use client';

import * as React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardDescription, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { PlusCircle } from 'lucide-react';
import { availableBiomarkerCards } from '@/lib/biomarker-cards';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { ActionIcon } from './ui/action-icon';

interface DiseaseCardLayoutProps {
  value: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isSingleAction?: boolean;
}

export function DiseaseCardLayout({ value, title, subtitle, icon, children, isSingleAction = false }: DiseaseCardLayoutProps) {
  const [activeDialogKey, setActiveDialogKey] = React.useState<string | null>(null);

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
    
    const dialogElement = availableBiomarkerCards[dialogKey]?.addRecordDialog;
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
    <AccordionItem value={value}>
        <div className="flex items-center w-full p-6">
            <AccordionTrigger className="flex-1 p-0">
                <div className="flex items-center gap-3 text-left w-full cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <CardTitle>{title}</CardTitle>
                        {subtitle && <CardDescription className="mt-1">{subtitle}</CardDescription>}
                    </div>
                </div>
            </AccordionTrigger>
             {Actions && <div className="pl-4" onClick={(e) => e.stopPropagation()}>{Actions}</div>}
        </div>
        <AccordionContent>
            {activeDialogKey ? (
              <div className="px-6 pb-6 w-full">{renderActiveDialog()}</div>
            ) : (
              <div className="px-6 pb-6 w-full">
                  <Separator className="mb-6" />
                  <div className="space-y-4">
                      {children}
                  </div>
              </div>
            )}
        </AccordionContent>
    </AccordionItem>
  );
}

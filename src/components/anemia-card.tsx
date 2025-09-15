
'use client';

import * as React from 'react';
import { HeartCrack, PlusCircle } from 'lucide-react'; // Using HeartCrack as a placeholder
import { HemoglobinCard } from './hemoglobin-card';
import { availableBiomarkerCards } from '@/lib/biomarker-cards';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { DashboardSectionToggle } from './dashboard-section-toggle';

export function AnemiaCard() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeDialogKey, setActiveDialogKey] = React.useState<string | null>(null);

    const dialogElement = availableBiomarkerCards['hemoglobin']?.addRecordDialog;
    const addRecordDialog = dialogElement ? React.cloneElement(dialogElement, {
      onCancel: () => setActiveDialogKey(null),
    }) : null;
    
    const actions = (
        <ActionMenu tooltip="Add New Record" icon={<PlusCircle className="h-4 w-4" />}>
            <DropdownMenuItem onSelect={() => setActiveDialogKey('hemoglobin')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Hemoglobin Record
            </DropdownMenuItem>
        </ActionMenu>
    );

    return (
        <DashboardSectionToggle
            title="Anemia Panel"
            subtitle="Check your hemoglobin levels"
            icon={<HeartCrack className="h-6 w-6 text-primary" />}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            actions={actions}
        >
            {activeDialogKey ? addRecordDialog : <HemoglobinCard key="hemoglobin" isReadOnly />}
        </DashboardSectionToggle>
    );
}

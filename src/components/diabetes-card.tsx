
'use client';

import * as React from 'react';
import { Droplet, PlusCircle } from 'lucide-react';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { DashboardSectionToggle } from './dashboard-section-toggle';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { availableBiomarkerCards } from '@/lib/biomarker-cards';

export function DiabetesCard() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeDialogKey, setActiveDialogKey] = React.useState<string | null>(null);

    const renderActiveDialog = () => {
        if (!activeDialogKey) return null;
        const dialogElement = availableBiomarkerCards[activeDialogKey as keyof typeof availableBiomarkerCards]?.addRecordDialog;
        if (!dialogElement) return null;
        return React.cloneElement(dialogElement, {
            onCancel: () => setActiveDialogKey(null),
        });
    };
    
    const actions = (
        <ActionMenu tooltip="Add New Record" icon={<PlusCircle className="h-4 w-4" />}>
             <DropdownMenuItem onSelect={() => setActiveDialogKey('hba1c')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New HbA1c Record
            </DropdownMenuItem>
             <DropdownMenuItem onSelect={() => setActiveDialogKey('glucose')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Fasting Glucose Record
            </DropdownMenuItem>
        </ActionMenu>
    );

    return (
        <DashboardSectionToggle
            title="Diabetes Panel"
            subtitle="Monitor your glucose & HbA1c"
            icon={<Droplet className="h-6 w-6 text-primary" />}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            actions={actions}
        >
            {activeDialogKey ? renderActiveDialog() : (
                <div className="space-y-4">
                    <Hba1cCard key="hba1c" isReadOnly />
                    <FastingBloodGlucoseCard key="glucose" isReadOnly />
                </div>
            )}
        </DashboardSectionToggle>
    );
}

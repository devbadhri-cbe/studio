
'use client';

import * as React from 'react';
import { Flame, PlusCircle } from 'lucide-react';
import { TotalCholesterolCard } from './total-cholesterol-card';
import { LdlCard } from './ldl-card';
import { HdlCard } from './hdl-card';
import { TriglyceridesCard } from './triglycerides-card';
import { DashboardSectionToggle } from './dashboard-section-toggle';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { availableBiomarkerCards } from '@/lib/biomarker-cards';

export function LipidPanelCard() {
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
            <DropdownMenuItem onSelect={() => setActiveDialogKey('lipidPanel')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Full Lipid Panel
            </DropdownMenuItem>
        </ActionMenu>
    );
    
    return (
        <DashboardSectionToggle
            title="Lipid Panel"
            subtitle="Manage your cholesterol & triglycerides"
            icon={<Flame className="h-6 w-6 text-primary" />}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            actions={actions}
        >
            {activeDialogKey ? renderActiveDialog() : (
                 <div className="space-y-4">
                    <TotalCholesterolCard key="totalCholesterol" isReadOnly={true} />
                    <LdlCard key="ldl" isReadOnly={true} />
                    <HdlCard key="hdl" isReadOnly={true} />
                    <TriglyceridesCard key="triglycerides" isReadOnly={true} />
                </div>
            )}
        </DashboardSectionToggle>
    );
}

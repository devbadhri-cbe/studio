
'use client';

import * as React from 'react';
import { Heart, PlusCircle } from 'lucide-react';
import { BloodPressureCard } from './blood-pressure-card';
import { DashboardSectionToggle } from './dashboard-section-toggle';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem } from './ui/dropdown-menu';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';


export function HypertensionCard() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isAdding, setIsAdding] = React.useState(false);

    const actions = (
        <ActionMenu tooltip="Add New Record" icon={<PlusCircle className="h-4 w-4" />}>
            <DropdownMenuItem onSelect={() => setIsAdding(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Blood Pressure Record
            </DropdownMenuItem>
        </ActionMenu>
    );

    return (
        <DashboardSectionToggle
            title="Hypertension Panel"
            subtitle="Keep track of your blood pressure"
            icon={<Heart className="h-6 w-6 text-primary" />}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            actions={actions}
        >
            {isAdding 
                ? <AddBloodPressureRecordDialog onCancel={() => setIsAdding(false)} /> 
                : <BloodPressureCard key="bloodPressure" isReadOnly />
            }
        </DashboardSectionToggle>
    );
}

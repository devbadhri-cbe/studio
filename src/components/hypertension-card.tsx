'use client';

import * as React from 'react';
import { Heart, Settings } from 'lucide-react';
import { UniversalCard } from './universal-card';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { BloodPressureCard } from './blood-pressure-card';
import { useApp } from '@/context/app-context';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from './ui/collapsible';

export function HypertensionCard() {
    const { profile, toggleBiomarkerInPanel } = useApp();
    const [isOpen, setIsOpen] = React.useState(true);

    const isBloodPressureEnabled = profile?.diseasePanels?.hypertension?.bloodPressure ?? true;

    const handleToggle = (biomarker: 'bloodPressure') => {
        toggleBiomarkerInPanel('hypertension', biomarker);
    };

    const BiomarkerToggle = ({ label, biomarkerKey, isEnabled }: { label: string, biomarkerKey: 'bloodPressure', isEnabled: boolean }) => (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Label htmlFor={`${biomarkerKey}-switch-htn`} className="flex items-center justify-between w-full cursor-pointer">
                <span>{label}</span>
                <Switch
                    id={`${biomarkerKey}-switch-htn`}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(biomarkerKey)}
                />
            </Label>
        </DropdownMenuItem>
    );

    const actions = (
        <ActionMenu tooltip="Panel Settings" icon={<Settings className="h-4 w-4" />}>
            <DropdownMenuLabel>Manage Biomarkers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <BiomarkerToggle label="Blood Pressure" biomarkerKey="bloodPressure" isEnabled={isBloodPressureEnabled} />
        </ActionMenu>
    );
    
    if (!isBloodPressureEnabled) {
        return (
            <UniversalCard
                title="Hypertension Panel"
                icon={<Heart className="h-6 w-6 text-primary" />}
                actions={actions}
            >
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4 min-h-[100px]">
                    <p className="text-sm">No biomarkers enabled for this panel.</p>
                    <p className="text-xs">Use the settings menu to add cards.</p>
                </div>
            </UniversalCard>
        )
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <UniversalCard
                title="Hypertension Panel"
                icon={<Heart className="h-6 w-6 text-primary" />}
                actions={actions}
            >
                <CollapsibleContent>
                    <div className="grid grid-cols-1 gap-6 transition-all">
                        {isBloodPressureEnabled && <BloodPressureCard isReadOnly />}
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}

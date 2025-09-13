
'use client';

import * as React from 'react';
import { Droplet, Settings } from 'lucide-react';
import { UniversalCard } from './universal-card';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Hba1cCard } from './hba1c-card';
import { FastingBloodGlucoseCard } from './fasting-blood-glucose-card';
import { useApp } from '@/context/app-context';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from './ui/collapsible';

export function DiabetesCard() {
    const { profile, toggleBiomarkerInPanel } = useApp();
    const [isOpen, setIsOpen] = React.useState(true);

    const isHba1cEnabled = profile?.diseasePanels?.diabetes?.hba1c ?? true;
    const isGlucoseEnabled = profile?.diseasePanels?.diabetes?.glucose ?? true;

    const handleToggle = (biomarker: 'hba1c' | 'glucose') => {
        toggleBiomarkerInPanel('diabetes', biomarker);
    };

    const BiomarkerToggle = ({ label, biomarkerKey, isEnabled }: { label: string, biomarkerKey: 'hba1c' | 'glucose', isEnabled: boolean }) => (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Label htmlFor={`${biomarkerKey}-switch-diabetes`} className="flex items-center justify-between w-full cursor-pointer">
                <span>{label}</span>
                <Switch
                    id={`${biomarkerKey}-switch-diabetes`}
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
            <BiomarkerToggle label="HbA1c" biomarkerKey="hba1c" isEnabled={isHba1cEnabled} />
            <BiomarkerToggle label="Fasting Blood Glucose" biomarkerKey="glucose" isEnabled={isGlucoseEnabled} />
        </ActionMenu>
    );
    
    if (!isHba1cEnabled && !isGlucoseEnabled) {
        return (
            <UniversalCard
                title="Diabetes Panel"
                icon={<Droplet className="h-6 w-6 text-primary" />}
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
                title="Diabetes Panel"
                icon={<Droplet className="h-6 w-6 text-primary" />}
                actions={actions}
            >
                <CollapsibleContent>
                    <div className={cn(
                        "grid grid-cols-1 gap-6 transition-all",
                        isHba1cEnabled && isGlucoseEnabled && "md:grid-cols-2"
                    )}>
                        {isHba1cEnabled && <Hba1cCard isReadOnly />}
                        {isGlucoseEnabled && <FastingBloodGlucoseCard isReadOnly />}
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}

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
import { HemoglobinCard } from './hemoglobin-card';

export function HypertensionCard() {
    const { profile, toggleBiomarkerInPanel } = useApp();
    const [isOpen, setIsOpen] = React.useState(true);

    const isBloodPressureEnabled = profile?.diseasePanels?.hypertension?.bloodPressure ?? true;
    const isHemoglobinEnabled = profile?.diseasePanels?.hypertension?.hemoglobin ?? false;

    const handleToggle = (biomarker: 'bloodPressure' | 'hemoglobin') => {
        toggleBiomarkerInPanel('hypertension', biomarker);
    };

    const BiomarkerToggle = ({ label, biomarkerKey, isEnabled }: { label: string, biomarkerKey: 'bloodPressure' | 'hemoglobin', isEnabled: boolean }) => (
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
            <BiomarkerToggle label="Hemoglobin" biomarkerKey="hemoglobin" isEnabled={isHemoglobinEnabled} />
        </ActionMenu>
    );

    const enabledCardsCount = [isBloodPressureEnabled, isHemoglobinEnabled].filter(Boolean).length;
    
    if (enabledCardsCount === 0) {
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
                    <div className={cn(
                        "grid grid-cols-1 gap-6 transition-all",
                        enabledCardsCount > 1 && "md:grid-cols-2"
                    )}>
                        {isBloodPressureEnabled && <BloodPressureCard isReadOnly />}
                        {isHemoglobinEnabled && <HemoglobinCard isReadOnly />}
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}

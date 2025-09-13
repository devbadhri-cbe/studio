'use client';

import * as React from 'react';
import { Flame, Settings } from 'lucide-react';
import { UniversalCard } from './universal-card';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useApp } from '@/context/app-context';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { TotalCholesterolCard } from './total-cholesterol-card';
import { LdlCard } from './ldl-card';
import { HdlCard } from './hdl-card';
import { TriglyceridesCard } from './triglycerides-card';

type LipidBiomarkerKey = 'total' | 'ldl' | 'hdl' | 'triglycerides';

export function LipidPanelCard() {
    const { profile, toggleBiomarkerInPanel } = useApp();
    const [isOpen, setIsOpen] = React.useState(true);

    const isEnabled = (key: LipidBiomarkerKey) => profile?.diseasePanels?.lipidPanel?.[key] ?? true;

    const handleToggle = (biomarker: LipidBiomarkerKey) => {
        toggleBiomarkerInPanel('lipidPanel', biomarker);
    };

    const BiomarkerToggle = ({ label, biomarkerKey }: { label: string, biomarkerKey: LipidBiomarkerKey }) => (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Label htmlFor={`${biomarkerKey}-switch-lipid`} className="flex items-center justify-between w-full cursor-pointer">
                <span>{label}</span>
                <Switch
                    id={`${biomarkerKey}-switch-lipid`}
                    checked={isEnabled(biomarkerKey)}
                    onCheckedChange={() => handleToggle(biomarkerKey)}
                />
            </Label>
        </DropdownMenuItem>
    );

    const actions = (
        <ActionMenu tooltip="Panel Settings" icon={<Settings className="h-4 w-4" />}>
            <DropdownMenuLabel>Manage Biomarkers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <BiomarkerToggle label="Total Cholesterol" biomarkerKey="total" />
            <BiomarkerToggle label="LDL Cholesterol" biomarkerKey="ldl" />
            <BiomarkerToggle label="HDL Cholesterol" biomarkerKey="hdl" />
            <BiomarkerToggle label="Triglycerides" biomarkerKey="triglycerides" />
        </ActionMenu>
    );

    const anyBiomarkerEnabled = ['total', 'ldl', 'hdl', 'triglycerides'].some(key => isEnabled(key as LipidBiomarkerKey));
    
    if (!anyBiomarkerEnabled) {
        return (
            <UniversalCard
                title="Lipid Panel"
                icon={<Flame className="h-6 w-6 text-primary" />}
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
                title="Lipid Panel"
                icon={<Flame className="h-6 w-6 text-primary" />}
                actions={actions}
            >
                <CollapsibleContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all">
                        {isEnabled('total') && <TotalCholesterolCard isReadOnly={true} />}
                        {isEnabled('ldl') && <LdlCard isReadOnly={true} />}
                        {isEnabled('hdl') && <HdlCard isReadOnly={true} />}
                        {isEnabled('triglycerides') && <TriglyceridesCard isReadOnly={true} />}
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}

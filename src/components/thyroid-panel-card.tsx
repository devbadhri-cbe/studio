
'use client';

import * as React from 'react';
import { Activity, Settings } from 'lucide-react';
import { UniversalCard } from './universal-card';
import { ActionMenu } from './ui/action-menu';
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useApp } from '@/context/app-context';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent } from './ui/collapsible';
import { ThyroidCard } from './thyroid-card';
import { ThyroxineCard } from './thyroxine-card';

type ThyroidBiomarkerKey = 'tsh' | 't4';

export function ThyroidPanelCard() {
    const { profile, toggleBiomarkerInPanel } = useApp();
    const [isOpen, setIsOpen] = React.useState(true);

    const isEnabled = (key: ThyroidBiomarkerKey) => profile?.diseasePanels?.thyroid?.[key] ?? true;

    const handleToggle = (biomarker: ThyroidBiomarkerKey) => {
        toggleBiomarkerInPanel('thyroid', biomarker);
    };

    const BiomarkerToggle = ({ label, biomarkerKey }: { label: string, biomarkerKey: ThyroidBiomarkerKey }) => (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Label htmlFor={`${biomarkerKey}-switch-thyroid`} className="flex items-center justify-between w-full cursor-pointer">
                <span>{label}</span>
                <Switch
                    id={`${biomarkerKey}-switch-thyroid`}
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
            <BiomarkerToggle label="TSH" biomarkerKey="tsh" />
            <BiomarkerToggle label="Thyroxine (T4)" biomarkerKey="t4" />
        </ActionMenu>
    );

    const enabledKeys: ThyroidBiomarkerKey[] = ['tsh', 't4'];
    const enabledCardsCount = enabledKeys.filter(key => isEnabled(key)).length;
    
    if (enabledCardsCount === 0) {
        return (
            <UniversalCard
                title="Thyroid Panel"
                icon={<Activity className="h-6 w-6 text-primary" />}
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
                title="Thyroid Panel"
                icon={<Activity className="h-6 w-6 text-primary" />}
                actions={actions}
            >
                <CollapsibleContent>
                    <div className={cn(
                        "grid grid-cols-1 gap-6 transition-all",
                        enabledCardsCount > 1 && "md:grid-cols-2"
                    )}>
                        {isEnabled('tsh') && <ThyroidCard isReadOnly={true} />}
                        {isEnabled('t4') && <ThyroxineCard isReadOnly={true} />}
                    </div>
                </CollapsibleContent>
            </UniversalCard>
        </Collapsible>
    );
}

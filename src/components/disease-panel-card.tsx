
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { InteractivePanelGrid } from './interactive-panel-grid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings, PlusCircle } from 'lucide-react';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';
import { useApp } from '@/context/app-context';

interface DiseasePanelCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode; // For hidden dialogs
  className?: string;
  isDoctorLoggedIn: boolean;
  addRecordActions: { label: string; action: () => void }[];
  panelKey: string;
  allPanelBiomarkers: BiomarkerKey[];
  enabledBiomarkers: BiomarkerKey[];
}

export function DiseasePanelCard({ 
    title, 
    icon, 
    children, 
    className, 
    isDoctorLoggedIn, 
    addRecordActions,
    panelKey,
    allPanelBiomarkers,
    enabledBiomarkers
}: DiseasePanelCardProps) {
    const { toggleDiseaseBiomarker } = useApp();

    const Actions = isDoctorLoggedIn ? (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel>Add New Record</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {addRecordActions.map(({ label, action }) => (
                        <DropdownMenuItem key={label} onSelect={action}>
                            {label}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add/Remove Biomarkers
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                             <DropdownMenuSubContent>
                                {allPanelBiomarkers.map((key) => {
                                    const isChecked = enabledBiomarkers.includes(key);
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={key}
                                            checked={isChecked}
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                toggleDiseaseBiomarker(panelKey, key);
                                            }}
                                        >
                                            {availableBiomarkerCards[key].label}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    ) : null;

    return (
        <Card className={cn("h-full shadow-xl flex flex-col", className)}>
            {children}
            <div className="flex flex-col flex-1 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className='flex items-center gap-3 flex-1'>
                        {icon}
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    </div>
                    {isDoctorLoggedIn && <div className="flex items-center gap-1 shrink-0">{Actions}</div>}
                </div>
                <CardContent className="p-0 flex-1 flex flex-col">
                    <InteractivePanelGrid>
                        {enabledBiomarkers.map(key => {
                            const cardInfo = availableBiomarkerCards[key];
                            return cardInfo ? cardInfo.component : null;
                        })}
                    </InteractivePanelGrid>
                </CardContent>
            </div>
        </Card>
    );
}

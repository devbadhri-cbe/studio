
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings, PlusCircle, Pencil } from 'lucide-react';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';
import { useApp } from '@/context/app-context';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { dateFormats } from '@/lib/countries';
import type { UnitSystem } from '@/lib/types';
import { ManagePanelBiomarkersDialog } from './manage-panel-biomarkers-dialog';


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
    const { profile, setProfile, biomarkerUnit, setBiomarkerUnit } = useApp();
    const [isManageBiomarkersOpen, setIsManageBiomarkersOpen] = React.useState(false);

    const Actions = isDoctorLoggedIn ? (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuLabel>Add New Record</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {addRecordActions.map(({ label, action }) => (
                        <DropdownMenuItem key={label} onSelect={action}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {label}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setIsManageBiomarkersOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Manage Biomarkers
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
                     <div className="grid gap-2 px-2 py-1">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="date-format" className="text-xs">Date Format</Label>
                            <Select
                                value={profile.dateFormat}
                                onValueChange={(value) => setProfile({...profile, dateFormat: value})}
                            >
                                <SelectTrigger className="col-span-2 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {dateFormats.map(df => (
                                        <SelectItem key={df.format} value={df.format} className="text-xs">{df.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="unit-system" className="text-xs">Units</Label>
                            <Select
                                value={profile.unitSystem}
                                onValueChange={(value) => setProfile({...profile, unitSystem: value as UnitSystem})}
                            >
                                <SelectTrigger className="col-span-2 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="metric" className="text-xs">Metric (cm, kg)</SelectItem>
                                    <SelectItem value="imperial" className="text-xs">Imperial (ft/in, lbs)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="biomarker-units" className="text-xs">Lab Units</Label>
                            <Select
                                value={biomarkerUnit}
                                onValueChange={(value) => setBiomarkerUnit(value as 'conventional' | 'si')}
                            >
                                <SelectTrigger className="col-span-2 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="conventional" className="text-xs">Conventional</SelectItem>
                                    <SelectItem value="si" className="text-xs">SI Units</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
            <ManagePanelBiomarkersDialog 
                open={isManageBiomarkersOpen}
                onOpenChange={setIsManageBiomarkersOpen}
                panelKey={panelKey}
                panelName={title}
            />
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        {enabledBiomarkers.map(key => {
                            const cardInfo = availableBiomarkerCards[key];
                            return cardInfo ? React.cloneElement(cardInfo.component, { key }) : null;
                        })}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

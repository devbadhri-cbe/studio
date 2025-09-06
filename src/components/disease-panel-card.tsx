

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
import { Settings, Search, ChevronDown, Check } from 'lucide-react';
import { availableBiomarkerCards, type BiomarkerKey, availableDiseasePanels } from '@/lib/biomarker-cards';
import { useApp } from '@/context/app-context';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { dateFormats } from '@/lib/countries';
import type { UnitSystem } from '@/lib/types';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';


interface DiseasePanelCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode; 
  className?: string;
  isDoctorLoggedIn: boolean;
  panelKey: string;
  allPanelBiomarkers: (BiomarkerKey | string)[];
}

type OpenSection = 'newRecord' | 'manageBiomarkers' | 'displaySettings' | 'managePanels' | null;


export function DiseasePanelCard({ 
    title, 
    icon, 
    children, 
    className, 
    isDoctorLoggedIn, 
    panelKey,
    allPanelBiomarkers,
}: DiseasePanelCardProps) {
    const { profile, setProfile, biomarkerUnit, setBiomarkerUnit, toggleDiseaseBiomarker, toggleDiseasePanel } = useApp();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [dialogTriggers, setDialogTriggers] = React.useState<Record<string, React.RefObject<HTMLButtonElement>>>({});
    const [openSection, setOpenSection] = React.useState<OpenSection>(null);

    const isNewRecordOpen = openSection === 'newRecord';
    const isManagingBiomarkers = openSection === 'manageBiomarkers';
    const isDisplaySettingsOpen = openSection === 'displaySettings';
    const isManagingPanels = openSection === 'managePanels';
    
    const enabledPanels = Object.keys(profile.enabledBiomarkers || {});
    const enabledForPanel = profile.enabledBiomarkers?.[panelKey] || [];

    const allAvailableBiomarkers = React.useMemo(() => {
        return Object.entries(availableBiomarkerCards)
            .map(([key, value]) => ({ key, label: value.label }));
    }, []);
    
    const addRecordActions = React.useMemo(() => {
        return enabledForPanel
            .map(key => availableBiomarkerCards[key as BiomarkerKey])
            .filter(Boolean) 
            .map(cardInfo => ({
                label: `New ${cardInfo.label} Record`,
                dialog: cardInfo.addRecordDialog,
                action: () => {
                    dialogTriggers[cardInfo.addRecordLabel]?.current?.click();
                }
            }));
    }, [enabledForPanel, dialogTriggers]);

    // Create refs for all possible dialogs
    React.useEffect(() => {
        const allLabels = Object.values(availableBiomarkerCards).map(v => v.addRecordLabel);
        setDialogTriggers(triggers => {
            const newTriggers = { ...triggers };
            allLabels.forEach(label => {
                if (!newTriggers[label]) {
                    newTriggers[label] = React.createRef<HTMLButtonElement>();
                }
            });
            return newTriggers;
        });
    }, []);

    const sortedAndFilteredBiomarkers = React.useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();

        const filtered = allAvailableBiomarkers.filter(b => 
            b.label.toLowerCase().includes(lowercasedQuery)
        );

        return filtered.sort((a, b) => {
            const aIsEnabled = enabledForPanel.includes(a.key);
            const bIsEnabled = enabledForPanel.includes(b.key);

            if (aIsEnabled && !bIsEnabled) return -1;
            if (!aIsEnabled && bIsEnabled) return 1;
            
            return a.label.localeCompare(b.label);
        });
    }, [allAvailableBiomarkers, enabledForPanel, searchQuery]);


    const Actions = isDoctorLoggedIn ? (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" onClick={(e) => e.stopPropagation()}>
                     <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setOpenSection(prev => prev === 'newRecord' ? null : 'newRecord');
                        }}
                        className="flex justify-between items-center"
                    >
                        <span className="font-semibold">New Record</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isNewRecordOpen && "rotate-180")} />
                    </DropdownMenuItem>
                    
                    {isNewRecordOpen && (
                         <div className="px-2 py-1 space-y-1">
                            {addRecordActions.length > 0 ? addRecordActions.map(({ label, action }) => (
                                <DropdownMenuItem key={label} onSelect={action}>
                                    {label}
                                </DropdownMenuItem>
                            )) : <p className="text-xs text-muted-foreground px-2">No biomarkers enabled.</p>}
                         </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setOpenSection(prev => prev === 'managePanels' ? null : 'managePanels');
                        }}
                        className="flex justify-between items-center"
                    >
                        <span className="font-semibold">Manage Disease Panels</span>
                         <ChevronDown className={cn("h-4 w-4 transition-transform", isManagingPanels && "rotate-180")} />
                    </DropdownMenuItem>

                    {isManagingPanels && (
                        <div className="px-2 py-1 space-y-2">
                             <ScrollArea className="h-48">
                                {availableDiseasePanels.map(({ key, label }) => (
                                    <DropdownMenuItem key={key} onSelect={(e) => { e.preventDefault(); toggleDiseasePanel(key as DiseasePanelKey); }}>
                                        <div className="w-4 mr-2">
                                            {enabledPanels.includes(key) && <Check className="h-4 w-4" />}
                                        </div>
                                        <span className="font-normal flex-1">
                                            {label}
                                        </span>
                                    </DropdownMenuItem>
                                ))}
                            </ScrollArea>
                        </div>
                    )}

                    <DropdownMenuSeparator />
                     <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setOpenSection(prev => prev === 'manageBiomarkers' ? null : 'manageBiomarkers');
                        }}
                        className="flex justify-between items-center"
                    >
                        <span className="font-semibold">Manage Panel Biomarkers</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isManagingBiomarkers && "rotate-180")} />
                    </DropdownMenuItem>
                    
                    {isManagingBiomarkers && (
                        <div className="px-2 py-1 space-y-2">
                            <div className="relative mb-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search biomarkers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg bg-background pl-8 h-9"
                                />
                            </div>
                            <ScrollArea className="h-48">
                                {sortedAndFilteredBiomarkers.map(({ key, label }) => (
                                    <DropdownMenuItem key={key} onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                                        <Checkbox
                                            id={`check-${panelKey}-${key}`}
                                            checked={enabledForPanel.includes(key)}
                                            onCheckedChange={() => toggleDiseaseBiomarker(panelKey, key as BiomarkerKey)}
                                            className="mr-2"
                                        />
                                        <Label htmlFor={`check-${panelKey}-${key}`} className="font-normal cursor-pointer flex-1">
                                            {label}
                                        </Label>
                                    </DropdownMenuItem>
                                ))}
                            </ScrollArea>
                        </div>
                    )}
                    
                    <DropdownMenuSeparator />
                     <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setOpenSection(prev => prev === 'displaySettings' ? null : 'displaySettings');
                        }}
                        className="flex justify-between items-center"
                    >
                        <span className="font-semibold">Display Settings</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isDisplaySettingsOpen && "rotate-180")} />
                    </DropdownMenuItem>

                    {isDisplaySettingsOpen && (
                        <div className="grid gap-2 px-2 py-1 mt-1">
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
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    ) : null;

    return (
        <Card className={cn("h-full shadow-xl flex flex-col", className)}>
             {Object.entries(availableBiomarkerCards).map(([key, cardInfo]) => (
                <div key={key} style={{ display: 'none' }}>
                    {React.cloneElement(cardInfo.addRecordDialog, {
                        children: <button ref={dialogTriggers[cardInfo.addRecordLabel]}></button>
                    })}
                </div>
            ))}
            <div className="flex flex-col flex-1 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className='flex items-center gap-3 flex-1'>
                        {icon}
                        <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    </div>
                    {isDoctorLoggedIn && <div className="flex items-center gap-1 shrink-0">{Actions}</div>}
                </div>
                <CardContent className="p-0 flex-1 flex flex-col">
                    {children}
                </CardContent>
            </div>
        </Card>
    );
}

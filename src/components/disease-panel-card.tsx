
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
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings, PlusCircle } from 'lucide-react';
import { AddBiomarkerToPanelDialog } from './add-biomarker-to-panel-dialog';
import { BiomarkerKey } from '@/lib/biomarker-cards';

interface DiseasePanelCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isDoctorLoggedIn: boolean;
  addRecordActions: { label: string; action: () => void }[];
  panelKey: string;
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
    enabledBiomarkers
}: DiseasePanelCardProps) {
    const [isAddBiomarkerOpen, setIsAddBiomarkerOpen] = React.useState(false);

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
                    <DropdownMenuItem onSelect={() => setIsAddBiomarkerOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add/Remove Biomarkers
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AddBiomarkerToPanelDialog 
                panelKey={panelKey}
                enabledKeys={enabledBiomarkers}
                open={isAddBiomarkerOpen} 
                onOpenChange={setIsAddBiomarkerOpen} 
            />
        </>
    ) : null;

    return (
        <Card className={cn("h-full shadow-xl flex flex-col", className)}>
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
                        {children}
                    </InteractivePanelGrid>
                </CardContent>
            </div>
        </Card>
    );
}

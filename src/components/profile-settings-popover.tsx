

'use client';

import * as React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { dateFormats } from '@/lib/countries';
import { useApp } from '@/context/app-context';
import type { UnitSystem } from '@/lib/types';
import { Settings, Edit, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { ActionIcon } from './ui/action-icon';
import { toast } from '@/hooks/use-toast';

interface ProfileSettingsPopoverProps {
    onEdit: () => void;
}

export function ProfileSettingsPopover({ onEdit }: ProfileSettingsPopoverProps) {
  const { profile, setProfile, getFullPatientData } = useApp();
  
  const handleExportData = () => {
    try {
        const fullData = getFullPatientData();
        const jsonString = JSON.stringify(fullData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'health-guardian-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({
            title: "Data Exported",
            description: "Your backup file has been downloaded."
        });
    } catch (e) {
        console.error("Failed to export data", e);
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: "Could not export your data."
        })
    }
  };

  return (
    <Popover>
        <PopoverTrigger asChild>
            <ActionIcon tooltip="Display Settings" icon={<Settings className="h-4 w-4" />} onClick={(e) => e.stopPropagation()} />
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
            <div className="grid gap-4">
                 <div className="space-y-2">
                    <h4 className="font-medium leading-none">Profile</h4>
                    <p className="text-sm text-muted-foreground">
                       Edit your personal details.
                    </p>
                </div>
                 <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
                <Separator />
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">Display Settings</h4>
                    <p className="text-sm text-muted-foreground">
                        Customize your display preferences.
                    </p>
                </div>
                <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="date-format">Date Format</Label>
                        <Select
                            value={profile.dateFormat}
                            onValueChange={(value) => setProfile({...profile, dateFormat: value})}
                        >
                            <SelectTrigger className="col-span-2 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {dateFormats.map(df => (
                                    <SelectItem key={df.format} value={df.format}>{df.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="unit-system">Units</Label>
                        <Select
                            value={profile.unitSystem}
                            onValueChange={(value) => setProfile({...profile, unitSystem: value as UnitSystem})}
                        >
                            <SelectTrigger className="col-span-2 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                                <SelectItem value="imperial">Imperial (ft/in, lbs)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator />
                 <div className="space-y-2">
                    <h4 className="font-medium leading-none">Data Management</h4>
                    <p className="text-sm text-muted-foreground">
                       Save your data to a file.
                    </p>
                </div>
                 <Button variant="outline" size="sm" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
            </div>
        </PopoverContent>
    </Popover>
  );
}

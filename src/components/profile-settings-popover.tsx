

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
import { Settings, Edit, Download, Copy } from 'lucide-react';
import { Separator } from './ui/separator';
import { ActionIcon } from './ui/action-icon';
import { toast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { ThemeToggle } from './theme-toggle';

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

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.id).then(() => {
        toast({ title: "Patient ID Copied" });
    }).catch(err => {
        console.error("Failed to copy ID: ", err);
        toast({ variant: "destructive", title: "Copy Failed" });
    });
  }

  return (
    <Popover>
        <PopoverTrigger asChild>
            <ActionIcon tooltip="Display Settings" icon={<Settings className="h-4 w-4" />} onClick={(e) => e.stopPropagation()} />
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end" side="bottom" sideOffset={8}>
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
                        <Label>Theme</Label>
                        <div className="col-span-2 flex justify-end">
                            <ThemeToggle />
                        </div>
                    </div>
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
                       Save your data to a file or copy your unique ID.
                    </p>
                </div>
                <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input id="patient-id" value={profile.id} readOnly className="h-8 text-xs" />
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopyId}>
                          <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportData} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                    </Button>
                </div>
            </div>
        </PopoverContent>
    </Popover>
  );
}

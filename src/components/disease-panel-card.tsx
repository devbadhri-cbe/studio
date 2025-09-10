
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { availableBiomarkerCards, type BiomarkerKey, DiseasePanelKey } from '@/lib/biomarker-cards';
import { useApp } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface DiseasePanelCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  panelKey: DiseasePanelKey;
  allPanelBiomarkers: (BiomarkerKey | string)[];
}

export function DiseasePanelCard({
  title,
  icon,
  children,
  className,
  panelKey,
  allPanelBiomarkers,
}: DiseasePanelCardProps) {
  const { profile, toggleDiseaseBiomarker, toggleDiseasePanel, isDoctorLoggedIn } = useApp();

  const enabledForPanel = profile.enabledBiomarkers?.[panelKey] || [];
  const isPanelEnabledForPatient = profile.enabledBiomarkers?.hasOwnProperty(panelKey);
  
  const handlePanelToggle = (checked: boolean) => {
    toggleDiseasePanel(panelKey);
  }

  return (
    <Card className={cn("w-full flex flex-col h-full shadow-md border-2", isPanelEnabledForPatient ? "border-primary/20" : "border-dashed", className)}>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        {isDoctorLoggedIn && (
            <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`enable-panel-${panelKey}`}
                        checked={isPanelEnabledForPatient}
                        onCheckedChange={handlePanelToggle}
                    />
                </div>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!isPanelEnabledForPatient}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel>Manage Biomarkers</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-60 overflow-y-auto">
                        {allPanelBiomarkers.map((key) => {
                            const biomarkerInfo = availableBiomarkerCards[key as BiomarkerKey];
                            if (!biomarkerInfo) return null;

                            const isChecked = enabledForPanel.includes(key);

                            return (
                                <DropdownMenuItem key={key} onSelect={(e) => e.preventDefault()}>
                                    <Label htmlFor={`switch-${panelKey}-${key}`} className="flex-1 font-normal">{biomarkerInfo.label}</Label>
                                    <Switch
                                        id={`switch-${panelKey}-${key}`}
                                        checked={isChecked}
                                        onCheckedChange={() => toggleDiseaseBiomarker(panelKey, key)}
                                    />
                                </DropdownMenuItem>
                            );
                        })}
                    </div>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {isPanelEnabledForPatient ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start">
            {children}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-4 min-h-[200px] bg-muted/30 rounded-lg">
            <p className="text-sm">This panel is currently disabled for the patient.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

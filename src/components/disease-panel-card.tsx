
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { availableBiomarkerCards, type BiomarkerKey, DiseasePanelKey } from '@/lib/biomarker-cards';
import { useApp } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { InteractivePanelGrid } from './interactive-panel-grid';

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
  const { profile, toggleDiseaseBiomarker, toggleDiseasePanel } = useApp();

  const enabledForPanel = profile.enabledBiomarkers?.[panelKey] || [];
  const isPanelEnabledForPatient = profile.enabledBiomarkers?.hasOwnProperty(panelKey);
  
  const handlePanelToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleDiseasePanel(panelKey);
  }

  return (
    <Card className={cn("w-full flex flex-col h-full shadow-md border-2 border-primary/20", isPanelEnabledForPatient ? "border-primary/20" : "border-dashed", className)}>
        <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-3">
            {icon}
            <CardTitle>{title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    size="sm"
                    variant={isPanelEnabledForPatient ? 'secondary' : 'default'}
                    onClick={handlePanelToggle}
                >
                     {isPanelEnabledForPatient ? "Disable Panel" : "Enable Panel"}
                </Button>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!isPanelEnabledForPatient}>
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuLabel>Visible Biomarkers</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allPanelBiomarkers.map((key) => {
                        const biomarkerInfo = availableBiomarkerCards[key as BiomarkerKey];
                        if (!biomarkerInfo) return null;

                        const isChecked = enabledForPanel.includes(key);

                        return (
                            <DropdownMenuCheckboxItem
                            key={key}
                            checked={isChecked}
                            onSelect={(e) => e.preventDefault()}
                            onClick={() => toggleDiseaseBiomarker(panelKey, key)}
                            >
                            {biomarkerInfo.label}
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {isPanelEnabledForPatient ? (
          <InteractivePanelGrid>
            {children}
          </InteractivePanelGrid>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-4 min-h-[200px] bg-muted/30 rounded-lg">
            <p className="text-sm">This panel is currently disabled for the patient.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

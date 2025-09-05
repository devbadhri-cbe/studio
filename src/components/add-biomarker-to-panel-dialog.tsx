
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/app-context';
import { availableBiomarkerCards, type BiomarkerKey } from '@/lib/biomarker-cards';

interface AddBiomarkerToPanelDialogProps {
  panelKey: string;
  enabledKeys: BiomarkerKey[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBiomarkerToPanelDialog({ panelKey, enabledKeys, open, onOpenChange }: AddBiomarkerToPanelDialogProps) {
  const { toggleDiseaseBiomarker } = useApp();

  const allBiomarkerKeys = Object.keys(availableBiomarkerCards) as BiomarkerKey[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize Panel Biomarkers</DialogTitle>
          <DialogDescription>
            Select the biomarkers to display in this panel.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          {allBiomarkerKeys.map((key) => {
            const isChecked = enabledKeys.includes(key);
            return (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={`biomarker-${key}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleDiseaseBiomarker(panelKey, key)}
                />
                <Label htmlFor={`biomarker-${key}`} className="font-normal cursor-pointer">
                  {availableBiomarkerCards[key].label}
                </Label>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

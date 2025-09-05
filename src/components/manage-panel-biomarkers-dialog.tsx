
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useApp } from '@/context/app-context';
import { availableBiomarkerCards, BiomarkerKey } from '@/lib/biomarker-cards';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CreateBiomarkerDialog } from './create-biomarker-dialog';
import { ScrollArea } from './ui/scroll-area';

interface ManagePanelBiomarkersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelKey: string;
  panelName: string;
}

type AvailableBiomarker = {
    key: BiomarkerKey | string;
    label: string;
    isCustom: boolean;
}

export function ManagePanelBiomarkersDialog({ open, onOpenChange, panelKey, panelName }: ManagePanelBiomarkersDialogProps) {
  const { profile, setProfile, customBiomarkers } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [selectedBiomarkers, setSelectedBiomarkers] = React.useState<string[]>([]);
  
  const allAvailableBiomarkers = React.useMemo(() => {
    const standard = Object.entries(availableBiomarkerCards).map(([key, value]) => ({ key, label: value.label, isCustom: false }));
    const custom = (customBiomarkers || []).map(b => ({ key: b.id, label: b.name, isCustom: true }));
    return [...standard, ...custom];
  }, [customBiomarkers]);

  React.useEffect(() => {
    if (open) {
      setSelectedBiomarkers(profile.enabledBiomarkers?.[panelKey] || []);
    }
  }, [open, profile.enabledBiomarkers, panelKey]);

  const handleCheckboxChange = (key: string) => {
    setSelectedBiomarkers(prev => 
      prev.includes(key) ? prev.filter(b => b !== key) : [...prev, key]
    );
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updatedEnabledBiomarkers = {
        ...(profile.enabledBiomarkers || {}),
        [panelKey]: selectedBiomarkers,
      };
      setProfile({ ...profile, enabledBiomarkers: updatedEnabledBiomarkers });
      toast({
        title: 'Panel Updated',
        description: `The biomarkers for the ${panelName} have been updated.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update panel biomarkers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your changes. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSuccess = (newBiomarkerId: string) => {
    // Automatically select the newly created biomarker
    setSelectedBiomarkers(prev => [...prev, newBiomarkerId]);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Biomarkers</DialogTitle>
          <DialogDescription>
            Select which biomarkers to display in the "{panelName}".
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96 pr-6">
            <div className="space-y-4">
            {allAvailableBiomarkers.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                <Checkbox
                    id={`biomarker-${key}`}
                    checked={selectedBiomarkers.includes(key)}
                    onCheckedChange={() => handleCheckboxChange(key)}
                />
                <Label htmlFor={`biomarker-${key}`} className="font-normal cursor-pointer">
                    {label}
                </Label>
                </div>
            ))}
            </div>
        </ScrollArea>
        
        <Separator />
        
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Biomarker
        </Button>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <CreateBiomarkerDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
    />
    </>
  );
}

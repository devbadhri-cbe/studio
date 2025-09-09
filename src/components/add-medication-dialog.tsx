
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';
import { getMedicationInfo } from '@/ai/flows/process-medication-flow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { MedicationInfoOutput } from '@/lib/ai-types';

interface AddMedicationDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMedicationDialog({ children, onSuccess, open, onOpenChange }: AddMedicationDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processedMed, setProcessedMed] = React.useState<MedicationInfoOutput | null>(null);
  const { addMedication } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        medicationName: '',
        dosage: '',
        frequency: '',
      });
      setProcessedMed(null);
    }
  }, [open, form]);

  const handleProcessMedication = async () => {
    const brandName = form.getValues('medicationName');
    if (!brandName) {
      form.setError('medicationName', { type: 'manual', message: 'Medication name is required.' });
      return;
    }
    setIsProcessing(true);
    setProcessedMed(null);
    try {
      const result = await getMedicationInfo({ medicationName: brandName });
      if (result.activeIngredient) {
        setProcessedMed(result);
      } else {
        toast({ variant: 'destructive', title: 'Could not identify medication.' });
      }
    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process medication.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: {medicationName: string, dosage: string, frequency: string}) => {
    if (!processedMed) {
      await handleProcessMedication();
      return;
    }
    addMedication({
        name: processedMed.activeIngredient,
        brandName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
    });
    toast({
        title: 'Medication Added',
        description: `${data.medicationName} has been added to your list.`
    });
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <div style={{display: 'contents'}}>{children}</div>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
          <DialogDescription>Enter the medication details below. The AI will identify the active ingredient.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="medicationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name (Brand or Generic)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Rosuvas 20 or Metformin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {processedMed && (
              <Alert variant="default" className="bg-background">
                <AlertTitle className="font-semibold">AI Identified Ingredient</AlertTitle>
                <AlertDescription>
                  <p><strong>Active Ingredient:</strong> {processedMed.activeIngredient}</p>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Twice daily" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {processedMed ? 'Save Medication' : 'Check & Confirm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

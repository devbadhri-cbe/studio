'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { getMedicationInfo } from '@/ai/flows/process-medication-flow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { MedicationInfoOutput } from '@/lib/ai-types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { FoodInstruction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { FormActions } from './form-actions';

interface AddMedicationFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function AddMedicationForm({ onSuccess, onCancel }: AddMedicationFormProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processedMed, setProcessedMed] = React.useState<MedicationInfoOutput | null>(null);
  const { addMedication } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
      foodInstructions: undefined as FoodInstruction | undefined,
    },
  });

  const handleProcessMedication = async () => {
    const values = form.getValues();
    if (!values.medicationName) {
      form.setError('medicationName', { type: 'manual', message: 'Medication name is required.' });
      return;
    }
    setIsProcessing(true);
    setProcessedMed(null);
    try {
      const result = await getMedicationInfo({ 
        medicationName: values.medicationName,
        dosage: values.dosage,
        frequency: values.frequency,
        foodInstructions: values.foodInstructions
      });
      if (result.activeIngredient) {
        setProcessedMed(result);
        form.setValue('dosage', result.dosage || '');
        form.setValue('frequency', result.frequency || '');
        if (result.foodInstructions) {
            form.setValue('foodInstructions', result.foodInstructions);
        }
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

  const onSubmit = async (data: {medicationName: string, dosage: string, frequency: string, foodInstructions?: FoodInstruction}) => {
    if (!processedMed) {
      await handleProcessMedication();
      return;
    }
    addMedication({
        name: processedMed.activeIngredient,
        brandName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
        foodInstructions: data.foodInstructions,
    });
    toast({
        title: 'Medication Added',
        description: `${data.medicationName} has been added to your list.`
    });
    onCancel();
    onSuccess?.();
  };

  return (
    <Card className="mt-2 border-primary border-2">
        <CardHeader>
          <CardTitle>Add New Medication</CardTitle>
          <CardDescription>Enter the medication details below. The AI will identify the active ingredient and standardize the dosage.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="medicationName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Medication Name (Brand or Generic)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Tylenol PM or Metformin" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., 500 mg" {...field} />
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
                
                <FormField
                control={form.control}
                name="foodInstructions"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex items-center space-x-4 pt-2"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="before" />
                            </FormControl>
                            <FormLabel className="font-normal">Before Food</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="after" />
                            </FormControl>
                            <FormLabel className="font-normal">After Food</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="with" />
                            </FormControl>
                            <FormLabel className="font-normal">With Food</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                {processedMed && (
                <Alert variant="default" className="bg-background">
                    <AlertTitle className="font-semibold">AI Processed Information</AlertTitle>
                    <AlertDescription>
                    {processedMed.correctedMedicationName && <p><strong>Spelling Suggestion:</strong> {processedMed.correctedMedicationName}</p>}
                    <p><strong>Active Ingredient:</strong> {processedMed.activeIngredient}</p>
                    {processedMed.dosage && <p><strong>Standardized Dosage:</strong> {processedMed.dosage}</p>}
                    {processedMed.frequency && <p><strong>Standardized Frequency:</strong> {processedMed.frequency}</p>}
                    {processedMed.foodInstructionSuggestion && <p className="text-destructive"><strong>Suggestion:</strong> {processedMed.foodInstructionSuggestion}</p>}
                    </AlertDescription>
                </Alert>
                )}

                <FormActions
                  onCancel={onCancel}
                  isSubmitting={isProcessing}
                  submitText={processedMed ? 'Save Medication' : 'Check & Confirm'}
                />
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}

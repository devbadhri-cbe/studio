'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import type { FoodInstruction, Medication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { FormActions } from './form-actions';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { getMedicationInfo } from '@/ai/flows/process-medication-flow';


interface AddMedicationFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function AddMedicationForm({ onSuccess, onCancel }: AddMedicationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addMedication, updateMedication } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
      foodInstructions: undefined as FoodInstruction | undefined,
    },
  });

  const onSubmit = async (data: {medicationName: string, dosage: string, frequency: string, foodInstructions?: FoodInstruction}) => {
    setIsSubmitting(true);
    
    const newMedication: Omit<Medication, 'id'> = {
        name: 'pending...',
        brandName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
        foodInstructions: data.foodInstructions,
        status: 'pending_review',
    };

    // Add medication to state immediately for UI feedback
    const tempId = addMedication(newMedication);

    toast({
        title: 'Processing Medication...',
        description: `AI is analyzing "${data.medicationName}".`
    });

    onCancel();
    onSuccess?.();
    
    try {
      const result = await getMedicationInfo({ 
        medicationName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
        foodInstructions: data.foodInstructions,
      });

      if (result.activeIngredient) {
        updateMedication({
             id: tempId,
             name: result.activeIngredient,
             dosage: result.dosage || data.dosage,
             frequency: result.frequency || data.frequency,
             foodInstructions: result.foodInstructions || data.foodInstructions,
             brandName: result.correctedMedicationName || data.medicationName,
             status: 'processed',
        });
        toast({ title: "Medication Processed", description: `AI identified: ${result.activeIngredient}`});
      } else {
        throw new Error('AI could not identify the medication.');
      }
    } catch(e) {
      console.error(e);
      updateMedication({
          id: tempId,
          ...newMedication,
          status: 'failed',
      });
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process medication.' });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="mt-2 border-primary border-2">
        <CardHeader>
          <CardTitle>Add New Medication</CardTitle>
          <CardDescription>Enter the medication details. The AI will process it automatically.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="medicationName"
                rules={{ required: "Medication name is required." }}
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

                <FormActions
                  onCancel={onCancel}
                  isSubmitting={isSubmitting}
                  submitText={'Save Medication'}
                />
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}

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


interface EditMedicationFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
  initialData: Medication;
}

export function EditMedicationForm({ onSuccess, onCancel, initialData }: EditMedicationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { updateMedication } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      userInput: initialData.userInput || '',
      frequency: initialData.frequency || '',
      foodInstructions: initialData.foodInstructions,
    },
  });

  const onSubmit = async (data: {userInput: string, frequency: string, foodInstructions?: FoodInstruction}) => {
    setIsSubmitting(true);
    
    try {
      // For manual edits, we respect the user's input as the source of truth.
      // We are not re-running the AI here to avoid overwriting the user's correction.
      const updatedMedication: Medication = {
          ...initialData,
          name: data.userInput.split(' ')[0], // Simple split for the name part
          userInput: data.userInput,
          dosage: data.userInput.split(' ')[1] || '', // Simple split for dosage
          frequency: data.frequency,
          foodInstructions: data.foodInstructions,
          status: 'processed', // Mark as processed since it's a manual correction
      };
      
      updateMedication(updatedMedication);

      toast({ title: "Medication Updated", description: `Your changes to ${initialData.name} have been saved.`});

      onCancel();
      onSuccess?.();

    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update medication. Please try again.' });
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="mt-2 border-primary border-2">
        <CardHeader>
          <CardTitle>Edit Medication</CardTitle>
          <CardDescription>Manually correct the details for this medication.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="userInput"
                rules={{ required: "Medication name is required." }}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Medication Name & Dosage</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Tylenol PM or Metformin 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-1 gap-4">
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
                  submitText={'Save Changes'}
                />
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}


'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import type { FoodInstruction, Medication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { FormActions } from './form-actions';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';


interface EditMedicationFormProps {
  onSave: (data: Medication) => void;
  onCancel: () => void;
  initialData: Medication;
}

export function EditMedicationForm({ onSave, onCancel, initialData }: EditMedicationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      userInput: initialData.userInput || '',
      name: initialData.name || '',
      dosage: initialData.dosage || '',
      frequency: initialData.frequency || '',
      foodInstructions: initialData.foodInstructions,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const updatedData: Medication = {
          ...initialData,
          name: data.name,
          userInput: data.userInput,
          dosage: data.dosage,
          frequency: data.frequency,
          foodInstructions: data.foodInstructions,
      };
      
      onSave(updatedData);

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
                    name="name"
                    rules={{ required: "Medication name is required." }}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Medication Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Acetaminophen" {...field} />
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
                  submitText={'Confirm Changes'}
                />
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}


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
import { Loader2 } from 'lucide-react';


interface AddMedicationFormProps {
  onSuccess?: (data: Omit<Medication, 'id'>) => void;
  onCancel: () => void;
}

type UserInput = { userInput: string; frequency: string; foodInstructions?: FoodInstruction };


export const AddMedicationForm = React.forwardRef((props: AddMedicationFormProps, ref) => {
  const { onSuccess, onCancel } = props;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    defaultValues: {
      userInput: '',
      dosage: '',
      frequency: '',
      foodInstructions: undefined as FoodInstruction | undefined,
    },
  });

  const handleInitialSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    const newMedication: Omit<Medication, 'id'> = {
        name: data.userInput,
        userInput: data.userInput,
        dosage: data.dosage,
        frequency: data.frequency,
        foodInstructions: data.foodInstructions,
        status: 'processed'
    };

    onSuccess?.(newMedication);
    setIsSubmitting(false);
  };

  return (
    <Card className="mt-2 border-primary border-2">
        <CardHeader>
          <CardTitle>Add New Medication</CardTitle>
          <CardDescription>Enter the medication details below.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="userInput"
                rules={{ required: "Medication name is required." }}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Tylenol PM" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
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
                  submitText={'Save Medication'}
                />
            </form>
            </Form>
        </CardContent>
    </Card>
  );
});

AddMedicationForm.displayName = 'AddMedicationForm';

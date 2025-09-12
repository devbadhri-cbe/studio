
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
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Wand2 } from 'lucide-react';
import type { MedicationInfoOutput } from '@/lib/ai-types';


interface EditMedicationFormProps {
  onSuccess: (data: MedicationInfoOutput & { userInput: string }) => void;
  onCancel: () => void;
  initialData: Medication & { userInput: string };
}

export function EditMedicationForm({ onSuccess, onCancel, initialData }: EditMedicationFormProps) {
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

  const onSubmit = async (data: { userInput: string; name: string; dosage: string; frequency: string; foodInstructions?: FoodInstruction}) => {
    setIsSubmitting(true);
    
    try {
      const updatedData: MedicationInfoOutput & { userInput: string } = {
          activeIngredient: data.name,
          userInput: data.userInput,
          dosage: data.dosage,
          frequency: data.frequency,
          foodInstructions: data.foodInstructions,
          isBrandName: (initialData as any).isBrandName,
          spellingSuggestion: (initialData as any).spellingSuggestion,
      };
      
      toast({ title: "Medication Updated", description: `Your changes have been staged.`});

      onSuccess(updatedData);

    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update medication. Please try again.' });
    }
    
    setIsSubmitting(false);
  };
  
  const spellingSuggestion = (initialData as any).spellingSuggestion;

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
                    rules={{ required: "Original input is required." }}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Original Input</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Tylenol 500mg" {...field} />
                        </FormControl>
                         {spellingSuggestion && (
                           <Alert className="mt-2 p-2 bg-accent/10 border-accent/20">
                             <AlertDescription className="text-xs flex items-center justify-between gap-2">
                               <span>AI Suggestion: <span className="font-semibold">{spellingSuggestion}</span></span>
                               <Button
                                 type="button"
                                 size="xs"
                                 variant="outline"
                                 onClick={() => form.setValue('userInput', spellingSuggestion)}
                               >
                                 <Wand2 className="mr-1 h-3 w-3" />
                                 Use
                               </Button>
                             </AlertDescription>
                           </Alert>
                         )}
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Active ingredient is required." }}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Active Ingredient</FormLabel>
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

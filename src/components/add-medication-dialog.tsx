
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
import type { MedicationInfoOutput } from '@/lib/ai-types';
import { MedicationReviewCard } from './medication-review-card';
import { Loader2 } from 'lucide-react';


interface AddMedicationFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

type FormStep = 'input' | 'loading' | 'review' | 'failed';
type UserInput = { userInput: string; frequency: string; foodInstructions?: FoodInstruction };


export const AddMedicationForm = React.forwardRef((props: AddMedicationFormProps, ref) => {
  const { onSuccess, onCancel } = props;
  const [step, setStep] = React.useState<FormStep>('input');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [userInput, setUserInput] = React.useState<UserInput | null>(null);
  const [aiResult, setAiResult] = React.useState<MedicationInfoOutput | null>(null);
  const [reprocessingMed, setReprocessingMed] = React.useState<Medication | null>(null);
  const { addMedication, updateMedication, profile } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      userInput: '',
      frequency: '',
      foodInstructions: undefined as FoodInstruction | undefined,
    },
  });

  React.useImperativeHandle(ref, () => ({
    startReprocessing: (med: Medication) => {
      setReprocessingMed(med);
      form.reset({
        userInput: med.userInput,
        frequency: med.frequency,
        foodInstructions: med.foodInstructions,
      });
      handleInitialSubmit({
        userInput: med.userInput,
        frequency: med.frequency,
        foodInstructions: med.foodInstructions,
      });
    },
  }));

  const handleInitialSubmit = async (data: UserInput) => {
    setIsSubmitting(true);
    setStep('loading');
    setUserInput(data);
    
    try {
      toast({
          title: 'Processing Medication...',
          description: `AI is analyzing "${data.userInput}".`
      });

      const result = await getMedicationInfo({ 
        userInput: data.userInput,
        frequency: data.frequency,
        foodInstructions: data.foodInstructions,
        country: profile.country,
      });

      setAiResult(result);
      if (result.activeIngredient) {
        setStep('review');
      } else {
        throw new Error("Could not identify medication.");
      }

    } catch(e) {
      console.error(e);
      if (reprocessingMed) {
        // If reprocessing fails, update status but keep existing data
        updateMedication({ ...reprocessingMed, status: 'failed', ...aiResult });
      }
      setStep('failed');
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process medication. Please check the name and try again.' });
       onCancel(); // Close form on failure
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFinalSave = (confirmedData: { aiResult: MedicationInfoOutput, userInput: UserInput }) => {
      const { aiResult, userInput: finalUserInput } = confirmedData;
      if (reprocessingMed) {
        const updatedMed: Medication = {
          ...reprocessingMed,
          name: aiResult.activeIngredient,
          userInput: finalUserInput.userInput,
          dosage: aiResult.dosage || '',
          frequency: aiResult.frequency || finalUserInput.frequency,
          foodInstructions: aiResult.foodInstructions || finalUserInput.foodInstructions,
          status: 'processed',
          ...aiResult,
        };
        updateMedication(updatedMed);
        toast({ title: "Medication Updated", description: `${aiResult.activeIngredient} has been successfully processed.`});
      } else {
        const newMedication: Omit<Medication, 'id'> = {
            name: aiResult.activeIngredient,
            userInput: finalUserInput.userInput,
            dosage: aiResult.dosage || '',
            frequency: aiResult.frequency || finalUserInput.frequency,
            foodInstructions: aiResult.foodInstructions || finalUserInput.foodInstructions,
            status: 'processed',
            ...aiResult,
        };
        addMedication(newMedication);
        toast({ title: "Medication Saved", description: `${aiResult.activeIngredient} has been added to your list.`});
      }
      
      onCancel(); // Close the form area
      onSuccess?.();
  };

  const handleEdit = (editedData: MedicationInfoOutput) => {
    // When user confirms edits, save it
    // The userInput might have been changed in the edit form
     handleFinalSave({ aiResult: editedData, userInput: { userInput: editedData.userInput || userInput!.userInput, frequency: editedData.frequency || userInput!.frequency, foodInstructions: editedData.foodInstructions || userInput!.foodInstructions } });
  }

  if (step === 'loading') {
    return (
        <Card className="mt-2 border-primary border-2">
            <CardContent className="p-6 flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3">AI is processing your entry...</p>
            </CardContent>
        </Card>
    );
  }

  if (step === 'review' && aiResult && userInput) {
    return (
        <MedicationReviewCard 
            userInput={userInput}
            aiResult={aiResult}
            onConfirm={handleFinalSave}
            onEdit={handleEdit}
            onCancel={() => { onCancel(); setStep('input'); }}
        />
    )
  }

  return (
    <Card className="mt-2 border-primary border-2">
        <CardHeader>
          <CardTitle>Add New Medication</CardTitle>
          <CardDescription>Enter the medication details. The AI will process and verify it.</CardDescription>
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
                  submitText={'Process with AI'}
                />
            </form>
            </Form>
        </CardContent>
    </Card>
  );
});

AddMedicationForm.displayName = 'AddMedicationForm';

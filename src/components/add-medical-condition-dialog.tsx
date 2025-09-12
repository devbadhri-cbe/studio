'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { type MedicalCondition } from '@/lib/types';
import { parseISO } from 'date-fns';
import { FormActions } from './form-actions';
import { DateInput } from './date-input';
import { processMedicalCondition } from '@/ai/flows/process-medical-condition-flow';

interface MedicalConditionFormValues {
  userInput: string;
  date: Date;
}

interface AddMedicalConditionFormProps {
    onSave: (data: MedicalCondition) => void;
    onCancel: () => void;
    initialData?: MedicalCondition;
}

export function AddMedicalConditionForm({ 
    onSave, 
    onCancel,
    initialData,
}: AddMedicalConditionFormProps) {
  const { profile, updateMedicalCondition } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const formMethods = useForm<MedicalConditionFormValues>({
    defaultValues: { 
        userInput: initialData?.userInput || initialData?.condition || '', 
        date: initialData?.date ? parseISO(initialData.date) : new Date(),
    },
  });
  
  const handleFormSubmit = async (data: MedicalConditionFormValues) => {
    if (!profile) return;
    setIsSubmitting(true);
    
    const isDuplicate = profile.presentMedicalConditions.some(c => 
        c.id !== initialData?.id &&
        c.userInput?.toLowerCase() === data.userInput.toLowerCase()
    );

    if (isDuplicate) {
        toast({ variant: 'destructive', title: 'Duplicate Condition', description: `This condition has already been added.` });
        setIsSubmitting(false);
        return;
    }

    const newCondition: MedicalCondition = {
      id: initialData?.id || `cond-${Date.now()}`,
      userInput: data.userInput,
      condition: data.userInput,
      icdCode: 'loading...',
      synopsis: '',
      date: data.date.toISOString(),
      status: 'pending_review',
    };

    onSave(newCondition);
    toast({
      title: "Processing Condition...",
      description: `AI is analyzing "${data.userInput}".`,
    });
    onCancel();

    try {
      const result = await processMedicalCondition({ condition: data.userInput });
      if (result.isValid && result.standardizedName && result.icdCode) {
          updateMedicalCondition({
              ...newCondition,
              condition: result.standardizedName,
              icdCode: result.icdCode,
              synopsis: result.synopsis || '',
          });
          toast({ title: 'Condition Processed', description: `AI identified: ${result.standardizedName} (${result.icdCode})` });
      } else {
          updateMedicalCondition({ ...newCondition, icdCode: 'failed' });
          toast({ variant: 'destructive', title: 'Condition Not Recognized', description: `Suggestions: ${result.suggestions?.join(', ') || 'None'}` });
      }
    } catch(e) {
      console.error(e);
      updateMedicalCondition({ ...newCondition, icdCode: 'failed' });
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process condition.' });
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="mt-2 border-primary border-2">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit' : 'Add'} Medical Condition</CardTitle>
        <CardDescription>Enter a condition. Our AI will process it automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
                control={formMethods.control}
                name="userInput"
                rules={{ required: "Condition name is required." }}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Condition Name</FormLabel>
                        <FormControl>
                            <Input {...field} ref={inputRef} placeholder="e.g., high blood pressure" autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            
            <DateInput 
              name="date"
              label="Date of Diagnosis"
              fromYear={new Date().getFullYear() - 50}
              toYear={new Date().getFullYear()}
            />
        
            <FormActions
              onCancel={onCancel}
              isSubmitting={isSubmitting}
              submitText={'Save Condition'}
            />
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

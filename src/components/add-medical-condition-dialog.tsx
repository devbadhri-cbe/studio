
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';
import { processMedicalCondition } from '@/ai/flows/process-medical-condition-flow';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { DatePicker } from './ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { type MedicalCondition } from '@/lib/types';
import { parseISO } from 'date-fns';

interface MedicalConditionFormValues {
  userInput: string;
  date: Date;
}

interface ProcessedCondition {
    standardizedName: string;
    icdCode: string;
    synopsis: string;
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
  const { profile } = useApp();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processedCondition, setProcessedCondition] = React.useState<ProcessedCondition | null>(
    initialData?.icdCode ? { standardizedName: initialData.condition, icdCode: initialData.icdCode, synopsis: initialData.synopsis || '' } : null
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const form = useForm<MedicalConditionFormValues>({
    defaultValues: { 
        userInput: initialData?.userInput || initialData?.condition || '', 
        date: initialData?.date ? parseISO(initialData.date) : new Date(),
    },
  });
  
  const handleProcessCondition = async () => {
    const userInput = form.getValues('userInput');
    if (!userInput) {
        form.setError('userInput', { type: 'manual', message: 'Condition name is required.' });
        return;
    }
    setIsProcessing(true);
    setProcessedCondition(null);
    try {
      const result = await processMedicalCondition({ condition: userInput });
      if (result.isValid && result.standardizedName && result.icdCode) {
        setProcessedCondition({
            standardizedName: result.standardizedName,
            icdCode: result.icdCode,
            synopsis: result.synopsis || '',
        });
        toast({ title: 'Condition Processed', description: `AI suggested: ${result.standardizedName} (${result.icdCode})` });
      } else {
        toast({ variant: 'destructive', title: 'Condition Not Recognized', description: `Suggestions: ${result.suggestions?.join(', ') || 'None'}` });
      }
    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process condition.' });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleFormSubmit = async (data: MedicalConditionFormValues) => {
    if (!processedCondition) {
        await handleProcessCondition();
        return;
    }

    const isDuplicate = profile.presentMedicalConditions.some(c => c.id !== initialData?.id && c.icdCode === processedCondition.icdCode);
    if (isDuplicate) {
        toast({ variant: 'destructive', title: 'Duplicate Condition', description: `A condition with ICD-11 code ${processedCondition.icdCode} already exists.` });
        return;
    }
    
    onSave({
      id: initialData?.id || `cond-${Date.now()}`,
      userInput: data.userInput,
      condition: processedCondition.standardizedName,
      icdCode: processedCondition.icdCode,
      synopsis: processedCondition.synopsis,
      date: data.date.toISOString(),
      status: 'pending_review',
    });
    onCancel();
  };

  return (
    <Card className="mt-2 border-primary border-2">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit' : 'Add'} Medical Condition</CardTitle>
        <CardDescription>Enter a condition and our AI will help standardize it.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
                control={form.control}
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
            
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Date of Diagnosis</FormLabel>
                    <FormControl>
                        <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        fromYear={new Date().getFullYear() - 50}
                        toYear={new Date().getFullYear()}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

            {processedCondition && (
            <Alert variant="default" className="bg-background">
                <AlertTitle className="font-semibold">AI Suggestion</AlertTitle>
                <AlertDescription>
                <p><strong>Official Name:</strong> {processedCondition.standardizedName}</p>
                <p><strong>ICD-11 Code:</strong> {processedCondition.icdCode}</p>
                </AlertDescription>
            </Alert>
            )}
        
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {processedCondition ? 'Confirm & Save' : 'Process & Review'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

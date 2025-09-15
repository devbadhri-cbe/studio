
'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { startOfDay } from 'date-fns';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DateInput } from './date-input';
import { FormActions } from './form-actions';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface AddLabReportFormProps {
    onCancel: () => void;
}

export function AddLabReportForm({ onCancel }: AddLabReportFormProps) {
  const { 
    addHba1cRecord,
    addFastingBloodGlucoseRecord,
    addBloodPressureRecord,
    addWeightRecord,
    addTotalCholesterolRecord,
    addLdlRecord,
    addHdlRecord,
    addTriglyceridesRecord,
    getDbGlucoseValue,
    biomarkerUnit,
    profile,
  } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formMethods = useForm({
    defaultValues: {
      date: new Date(),
      hba1c: '' as any,
      fastingBloodGlucose: '' as any,
      systolic: '' as any,
      diastolic: '' as any,
      heartRate: '' as any,
      weight: '' as any,
      totalCholesterol: '' as any,
      ldl: '' as any,
      hdl: '' as any,
      triglycerides: '' as any,
    },
  });

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    const date = startOfDay(data.date).toISOString();
    let recordsAddedCount = 0;

    if (data.hba1c) { addHba1cRecord({ date, value: Number(data.hba1c) }); recordsAddedCount++; }
    if (data.fastingBloodGlucose) { addFastingBloodGlucoseRecord({ date, value: getDbGlucoseValue(Number(data.fastingBloodGlucose)) }); recordsAddedCount++; }
    if (data.systolic && data.diastolic) { addBloodPressureRecord({ date, systolic: Number(data.systolic), diastolic: Number(data.diastolic), heartRate: data.heartRate ? Number(data.heartRate) : undefined }); recordsAddedCount++; }
    if (data.weight) { addWeightRecord({ date, value: Number(data.weight) }); recordsAddedCount++; }
    if (data.totalCholesterol) { addTotalCholesterolRecord({ date, value: Number(data.totalCholesterol) }); recordsAddedCount++; }
    if (data.ldl) { addLdlRecord({ date, value: Number(data.ldl) }); recordsAddedCount++; }
    if (data.hdl) { addHdlRecord({ date, value: Number(data.hdl) }); recordsAddedCount++; }
    if (data.triglycerides) { addTriglyceridesRecord({ date, value: Number(data.triglycerides) }); recordsAddedCount++; }

    toast({
      title: 'Success!',
      description: `Added ${recordsAddedCount} new record(s).`,
    });
    setIsSubmitting(false);
    onCancel();
  };

  const isImperial = profile?.unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const glucoseUnit = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';

  return (
    <Card className="border-primary border-2">
      <CardHeader>
        <CardTitle>Add New Lab Report</CardTitle>
        <CardDescription>Enter all available results from your lab report. Unfilled fields will be ignored.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DateInput name="date" label="Test Date" fromYear={new Date().getFullYear() - 10} toYear={new Date().getFullYear()} />
                    <FormField control={formMethods.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Weight ({weightUnit})</FormLabel><FormControl><Input type="number" step="0.01" placeholder={isImperial ? "e.g., 154.5" : "e.g., 70.5"} {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              
              <Separator />
              <h4 className="text-sm font-medium">Cardiovascular Panel</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={formMethods.control} name="systolic" render={({ field }) => ( <FormItem><FormLabel>Systolic (mmHg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 120" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={formMethods.control} name="diastolic" render={({ field }) => ( <FormItem><FormLabel>Diastolic (mmHg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 80" {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>
               <FormField control={formMethods.control} name="heartRate" render={({ field }) => ( <FormItem><FormLabel>Heart Rate (bpm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormMessage /></FormItem> )} />

              <Separator />
              <h4 className="text-sm font-medium">Diabetes Panel</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={formMethods.control} name="hba1c" render={({ field }) => ( <FormItem><FormLabel>HbA1c (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 5.7" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={formMethods.control} name="fastingBloodGlucose" render={({ field }) => ( <FormItem><FormLabel>Fasting Glucose ({glucoseUnit})</FormLabel><FormControl><Input type="number" step="any" placeholder={glucoseUnit === 'mg/dL' ? 'e.g., 95' : 'e.g., 5.3'} {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>

              <Separator />
              <h4 className="text-sm font-medium">Lipid Panel (mg/dL)</h4>
               <div className="grid grid-cols-2 gap-4">
                  <FormField control={formMethods.control} name="totalCholesterol" render={({ field }) => ( <FormItem><FormLabel>Total Cholesterol</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={formMethods.control} name="triglycerides" render={({ field }) => ( <FormItem><FormLabel>Triglycerides</FormLabel><FormControl><Input type="number" placeholder="e.g., 150" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={formMethods.control} name="ldl" render={({ field }) => ( <FormItem><FormLabel>LDL Cholesterol</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 100" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={formMethods.control} name="hdl" render={({ field }) => ( <FormItem><FormLabel>HDL Cholesterol</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl><FormMessage /></FormItem> )} />
              </div>
            </div>
            <FormActions onCancel={onCancel} isSubmitting={isSubmitting} submitText="Save Lab Report" />
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

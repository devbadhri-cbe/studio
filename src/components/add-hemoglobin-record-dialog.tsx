'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { startOfDay } from 'date-fns';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { AddRecordDialogLayout } from './add-record-dialog-layout';
import { DateInput } from './date-input';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(1, 'Value seems too low.').max(250, 'Value seems too high.'),
});

interface AddHemoglobinRecordDialogProps {
    onCancel: () => void;
}

export function AddHemoglobinRecordDialog({ onCancel }: AddHemoglobinRecordDialogProps) {
  const { addHemoglobinRecord, getDbHemoglobinValue, biomarkerUnit, profile } = useApp();
  const { toast } = useToast();
  const unitLabel = biomarkerUnit === 'si' ? 'g/L' : 'g/dL';

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      value: '' as any,
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    addHemoglobinRecord({
        date: startOfDay(data.date).toISOString(),
        hemoglobin: getDbHemoglobinValue(data.value),
    });
    toast({
        title: 'Success!',
        description: 'Your new hemoglobin record has been added.',
    });
    onCancel();
  };

  return (
      <AddRecordDialogLayout
        onCancel={onCancel}
        title="Add New Hemoglobin Record"
        description="Enter your value and the date it was measured."
        form={form}
        onSubmit={onSubmit}
        existingRecords={profile?.hemoglobinRecords}
      >
        <DateInput
            name="date"
            label="Date"
            fromYear={new Date().getFullYear() - 10}
            toYear={new Date().getFullYear()}
        />
        <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Hemoglobin ({unitLabel})</FormLabel>
                <FormControl>
                <Input type="number" step="0.1" placeholder={unitLabel === 'g/dL' ? 'e.g., 13.5' : 'e.g., 135'} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </AddRecordDialogLayout>
  );
}

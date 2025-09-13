
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { startOfDay } from 'date-fns';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { AddRecordDialogLayout } from './add-record-dialog-layout';
import { DateInput } from './date-input';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(1, 'Value is required.').max(25, 'Value seems too high.'),
});

interface AddRecordDialogProps {
    onSuccess?: () => void;
    onCancel: () => void;
}

export function AddRecordDialog({ onSuccess, onCancel }: AddRecordDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addHba1cRecord, profile } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      value: '' as any,
      date: new Date(),
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    addHba1cRecord({
      date: startOfDay(data.date).toISOString(),
      value: data.value,
    });
    toast({
      title: 'Success!',
      description: 'Your new HbA1c record has been added.',
    });
    setIsSubmitting(false);
    onSuccess?.();
  };

  return (
      <AddRecordDialogLayout
        onCancel={onCancel}
        title="Add New HbA1c Record"
        description="Enter the details of your new lab result here."
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        existingRecords={profile?.hba1cRecords}
      >
        <DateInput
            name="date"
            label="Test Date"
            fromYear={new Date().getFullYear() - 10}
            toYear={new Date().getFullYear()}
        />
        <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
                <FormItem>
                <FormLabel>HbA1c Result (%)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 5.7" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
      </AddRecordDialogLayout>
  );
}

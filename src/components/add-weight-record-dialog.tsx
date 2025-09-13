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
import { lbsToKg } from '@/lib/utils';
import { AddRecordButton } from './add-record-button';
import { DatePicker } from './ui/date-picker';
import { AddRecordDialogLayout } from './add-record-dialog-layout';
import { DateInput } from './date-input';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(2, 'Weight seems too low.').max(1000, 'Weight seems too high.'), // Increased max for lbs
});

interface AddWeightRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}

export function AddWeightRecordDialog({ children, onSuccess }: AddWeightRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addWeightRecord, profile } = useApp();
  const { toast } = useToast();
  const isImperial = profile?.unitSystem === 'imperial';

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      value: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        value: '' as any,
      });
    }
  }, [open, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    const dbValue = isImperial ? lbsToKg(data.value) : data.value;
    addWeightRecord({
        date: startOfDay(data.date).toISOString(),
        value: dbValue,
    });
    toast({
        title: 'Success!',
        description: 'Your new weight record has been added.',
    });
    setOpen(false);
    setIsSubmitting(false);
    onSuccess?.();
  };
  
   const triggerButton = children || (
      <AddRecordButton tooltipContent="Add Weight Record" />
   );


  return (
      <AddRecordDialogLayout
        open={open}
        onOpenChange={setOpen}
        trigger={triggerButton}
        title="Add New Weight Record"
        description="Enter your weight and the date it was measured."
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        existingRecords={profile?.weightRecords}
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
                <FormLabel>Weight ({isImperial ? 'lbs' : 'kg'})</FormLabel>
                <FormControl>
                <Input type="number" step="0.01" placeholder={isImperial ? "e.g., 154.5" : "e.g., 70.5"} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </AddRecordDialogLayout>
  );
}

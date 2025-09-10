
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { startOfDay } from 'date-fns';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { AddRecordButton } from './add-record-button';
import { DatePicker } from './ui/date-picker';
import { AddRecordDialogLayout } from './add-record-dialog-layout';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(0.1, 'Value seems too low.').max(15, 'Value seems too high.'),
});

interface AddSerumCreatinineRecordDialogProps {
    children?: React.ReactNode;
}

export function AddSerumCreatinineRecordDialog({ children }: AddSerumCreatinineRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addSerumCreatinineRecord, serumCreatinineRecords } = useApp();
  const { toast } = useToast();

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
    addSerumCreatinineRecord({
        date: startOfDay(data.date).toISOString(),
        value: data.value,
    });
    toast({
        title: 'Success!',
        description: 'Your new Serum Creatinine record has been added.',
    });
    setOpen(false);
    setIsSubmitting(false);
  };
  
   const triggerButton = children || (
      <AddRecordButton tooltipContent="Add Serum Creatinine Record" />
   );

  return (
      <AddRecordDialogLayout
        open={open}
        onOpenChange={setOpen}
        trigger={triggerButton}
        title="Add New Serum Creatinine Record"
        description="Enter your value and the date it was measured."
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        existingRecords={serumCreatinineRecords}
      >
        <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <FormControl>
                    <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    fromYear={new Date().getFullYear() - 10}
                    toYear={new Date().getFullYear()}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Serum Creatinine (mg/dL)</FormLabel>
                <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 0.9" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      </AddRecordDialogLayout>
  );
}

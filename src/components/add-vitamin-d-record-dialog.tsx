
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { startOfDay } from 'date-fns';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { AddRecordButton } from './add-record-button';
import { DatePicker } from './ui/date-picker';
import { AddRecordDialogLayout } from './add-record-dialog-layout';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(1, 'Value is required.'),
});

interface AddVitaminDRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}

export function AddVitaminDRecordDialog({ children, onSuccess }: AddVitaminDRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addVitaminDRecord, vitaminDRecords, biomarkerUnit, getDbVitaminDValue } = useApp();
  const { toast } = useToast();

  const getUnitLabel = (unit: 'conventional' | 'si') => (unit === 'si' ? 'nmol/L' : 'ng/mL');

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
  }, [open, biomarkerUnit, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    
    const dbValue = getDbVitaminDValue(data.value);

    addVitaminDRecord({
      date: startOfDay(data.date).toISOString(),
      value: dbValue,
    });
    toast({
      title: 'Success!',
      description: 'Your new Vitamin D record has been added.',
    });
    setIsSubmitting(false);
    setOpen(false);
    onSuccess?.();
  };

  const triggerButton = children || <AddRecordButton tooltipContent="Add Vitamin D Record" />;

  return (
      <AddRecordDialogLayout
        open={open}
        onOpenChange={setOpen}
        trigger={triggerButton}
        title="Add New Vitamin D Record"
        description="Enter the details of your new Vitamin D result here."
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        existingRecords={vitaminDRecords}
      >
        <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Test Date</FormLabel>
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
                <FormLabel>Vitamin D ({getUnitLabel(biomarkerUnit)})</FormLabel>
                <FormControl>
                    <Input type="number" step="any" placeholder={biomarkerUnit === 'si' ? "e.g., 75" : "e.g., 30"} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
      </AddRecordDialogLayout>
  );
}

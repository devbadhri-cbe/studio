
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { startOfDay, parseISO } from 'date-fns';

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


interface AddLipidRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}


export function AddLipidRecordDialog({ children, onSuccess }: AddLipidRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addLipidRecord, lipidRecords } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      date: new Date(),
      totalCholesterol: '' as any,
      ldl: '' as any,
      hdl: '' as any,
      triglycerides: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        totalCholesterol: '' as any,
        ldl: '' as any,
        hdl: '' as any,
        triglycerides: '' as any,
      });
    }
  }, [open, form]);

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    addLipidRecord({
      date: startOfDay(data.date).toISOString(),
      totalCholesterol: Number(data.totalCholesterol),
      ldl: Number(data.ldl),
      hdl: Number(data.hdl),
      triglycerides: Number(data.triglycerides),
    });
    toast({
      title: 'Success!',
      description: 'Your new lipid panel record has been added.',
    });
    setIsSubmitting(false);
    setOpen(false);
    onSuccess?.();
  };
  
  const triggerButton = children || <AddRecordButton tooltipContent="Add Lipid Panel Record" />;


  return (
      <AddRecordDialogLayout
        open={open}
        onOpenChange={setOpen}
        trigger={triggerButton}
        title="Add New Lipid Panel Record"
        description="Enter the details of your new lipid panel result here."
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        existingRecords={lipidRecords}
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
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="totalCholesterol"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Total Cholesterol (mg/dL)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 200" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="triglycerides"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Triglycerides (mg/dL)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 150" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="ldl"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>LDL (mg/dL)</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 100" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="hdl"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>HDL (mg/dL)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 50" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
      </AddRecordDialogLayout>
  );
}

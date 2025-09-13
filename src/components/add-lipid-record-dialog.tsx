'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { startOfDay } from 'date-fns';

import {
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
import { DateInput } from './date-input';


interface AddLipidRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}


export function AddLipidRecordDialog({ children, onSuccess }: AddLipidRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addTotalCholesterolRecord, addLdlRecord, addHdlRecord, addTriglyceridesRecord, profile } = useApp();
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
    const date = startOfDay(data.date).toISOString();
    
    if (data.totalCholesterol) addTotalCholesterolRecord({ date, value: Number(data.totalCholesterol) });
    if (data.ldl) addLdlRecord({ date, value: Number(data.ldl) });
    if (data.hdl) addHdlRecord({ date, value: Number(data.hdl) });
    if (data.triglycerides) addTriglyceridesRecord({ date, value: Number(data.triglycerides) });
    
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
        existingRecords={profile?.totalCholesterolRecords} // Use one as a proxy
      >
        <DateInput
            name="date"
            label="Test Date"
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

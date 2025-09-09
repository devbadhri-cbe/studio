
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


interface AddThyroidRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}


export function AddThyroidRecordDialog({ children, onSuccess }: AddThyroidRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addThyroidRecord, profile, thyroidRecords } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      date: new Date(),
      tsh: '' as any,
      t3: '' as any,
      t4: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        tsh: '' as any,
        t3: '' as any,
        t4: '' as any,
      });
    }
  }, [open, form]);

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    const newDate = startOfDay(data.date);

    const dateExists = thyroidRecords.some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A thyroid record for this date already exists. Please choose a different date.',
      });
      setIsSubmitting(false);
      return;
    }
    
    addThyroidRecord({
      date: newDate.toISOString(),
      tsh: Number(data.tsh),
      t3: Number(data.t3),
      t4: Number(data.t4),
    });
    toast({
      title: 'Success!',
      description: 'Your new thyroid record has been added.',
    });
    setIsSubmitting(false);
    setOpen(false);
    onSuccess?.();
  };
  
  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!profile.medication || profile.medication.length === 0) {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Medication Required',
        description: 'Please enter your current medication or select "Nil" in your profile before adding a new record.',
      });
    }
  };

  const triggerButton = children || <AddRecordButton tooltipContent="Add Thyroid Record" onClick={handleTriggerClick} />;


  return (
      <AddRecordDialogLayout
        open={open}
        onOpenChange={setOpen}
        trigger={triggerButton}
        title="Add New Thyroid Record"
        description="Enter the details of your new thyroid panel result here."
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
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
        <div className="grid grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="tsh"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>TSH (μIU/mL)</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 2.5" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="t3"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>T3 (pg/mL)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 3.0" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="t4"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>T4 (ng/dL)</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 1.2" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
      </AddRecordDialogLayout>
  );
}

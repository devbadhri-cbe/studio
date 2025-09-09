
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { startOfDay, parseISO } from 'date-fns';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { AddRecordButton } from './add-record-button';
import { DatePicker } from './ui/date-picker';
import { AddRecordDialogLayout } from './add-record-dialog-layout';


interface AddBloodPressureRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}

export function AddBloodPressureRecordDialog({ children, onSuccess }: AddBloodPressureRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addBloodPressureRecord, profile, bloodPressureRecords } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      date: new Date(),
      systolic: '' as any,
      diastolic: '' as any,
      heartRate: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        systolic: '' as any,
        diastolic: '' as any,
        heartRate: '' as any,
      });
    }
  }, [open, form]);

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    const newDate = startOfDay(data.date);

    const dateExists = bloodPressureRecords.some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A blood pressure record for this date already exists. Please choose a different date.',
      });
      setIsSubmitting(false);
      return;
    }
    
    addBloodPressureRecord({
      date: newDate.toISOString(),
      systolic: Number(data.systolic),
      diastolic: Number(data.diastolic),
      heartRate: Number(data.heartRate),
    });
    toast({
      title: 'Success!',
      description: 'Your new blood pressure record has been added.',
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

  const triggerButton = children || <AddRecordButton tooltipContent="Add Blood Pressure Record" onClick={handleTriggerClick} />;

  return (
      <AddRecordDialogLayout
        open={open}
        onOpenChange={setOpen}
        trigger={triggerButton}
        title="Add New Blood Pressure Record"
        description="Enter your systolic, diastolic, and heart rate readings."
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
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="systolic"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Systolic (mmHg)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 120" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="diastolic"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Diastolic (mmHg)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 80" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="heartRate"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Heart Rate (bpm)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="e.g., 70" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
      </AddRecordDialogLayout>
  );
}

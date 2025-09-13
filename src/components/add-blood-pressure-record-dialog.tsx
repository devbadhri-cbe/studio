
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { startOfDay } from 'date-fns';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { AddRecordDialogLayout } from './add-record-dialog-layout';
import { DateInput } from './date-input';


interface AddBloodPressureRecordDialogProps {
    onSuccess?: () => void;
    onCancel: () => void;
}

export function AddBloodPressureRecordDialog({ onSuccess, onCancel }: AddBloodPressureRecordDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addBloodPressureRecord, profile } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      date: new Date(),
      systolic: '' as any,
      diastolic: '' as any,
      heartRate: '' as any,
    },
  });

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    addBloodPressureRecord({
      date: startOfDay(data.date).toISOString(),
      systolic: Number(data.systolic),
      diastolic: Number(data.diastolic),
      heartRate: Number(data.heartRate),
    });
    toast({
      title: 'Success!',
      description: 'Your new blood pressure record has been added.',
    });
    setIsSubmitting(false);
    onSuccess?.();
  };

  return (
      <AddRecordDialogLayout
        onCancel={onCancel}
        title="Add New Blood Pressure Record"
        description="Enter your systolic, diastolic, and heart rate readings."
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        existingRecords={profile?.bloodPressureRecords}
      >
        <DateInput
            name="date"
            label="Test Date"
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

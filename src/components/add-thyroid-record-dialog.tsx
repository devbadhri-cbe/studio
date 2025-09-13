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
import { AddRecordDialogLayout } from './add-record-dialog-layout';
import { DateInput } from './date-input';


interface AddThyroidRecordDialogProps {
    onCancel: () => void;
}


export function AddThyroidRecordDialog({ onCancel }: AddThyroidRecordDialogProps) {
  const { addThyroidRecord, profile } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      date: new Date(),
      tsh: '' as any,
      t3: '' as any,
      t4: '' as any,
    },
  });

  const onSubmit = (data: any) => {
    addThyroidRecord({
      date: startOfDay(data.date).toISOString(),
      tsh: Number(data.tsh),
      t3: Number(data.t3),
      t4: Number(data.t4),
    });
    toast({
      title: 'Success!',
      description: 'Your new thyroid record has been added.',
    });
    onCancel();
  };

  return (
      <AddRecordDialogLayout
        onCancel={onCancel}
        title="Add New Thyroid Record"
        description="Enter the details of your new thyroid panel result here."
        form={form}
        onSubmit={onSubmit}
        existingRecords={profile?.thyroidRecords}
      >
        <DateInput
            name="date"
            label="Test Date"
            fromYear={new Date().getFullYear() - 10}
            toYear={new Date().getFullYear()}
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

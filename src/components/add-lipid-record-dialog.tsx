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


interface AddLipidRecordDialogProps {
    onCancel: () => void;
}


export function AddLipidRecordDialog({ onCancel }: AddLipidRecordDialogProps) {
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

  const onSubmit = (data: any) => {
    const date = startOfDay(data.date).toISOString();
    
    if (data.totalCholesterol) addTotalCholesterolRecord({ date, value: Number(data.totalCholesterol) });
    if (data.ldl) addLdlRecord({ date, value: Number(data.ldl) });
    if (data.hdl) addHdlRecord({ date, value: Number(data.hdl) });
    if (data.triglycerides) addTriglyceridesRecord({ date, value: Number(data.triglycerides) });
    
    toast({
      title: 'Success!',
      description: 'Your new lipid panel record has been added.',
    });
    onCancel();
  };


  return (
      <AddRecordDialogLayout
        onCancel={onCancel}
        title="Add New Lipid Panel Record"
        description="Enter the details of your new lipid panel result here."
        form={form}
        onSubmit={onSubmit}
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

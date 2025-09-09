
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { AddRecordDialogLayout } from './add-record-dialog-layout';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';

interface AddMedicationDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMedicationDialog({ children, onSuccess, open, onOpenChange }: AddMedicationDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addMedication } = useApp();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        medicationName: '',
        dosage: '',
        frequency: '',
      });
    }
  }, [open, form]);

  const onSubmit = (data: {medicationName: string, dosage: string, frequency: string}) => {
    setIsSubmitting(true);
    addMedication({
        name: data.medicationName,
        brandName: data.medicationName, // Assuming brandName is same as name for now
        dosage: data.dosage,
        frequency: data.frequency,
    });
    toast({
        title: 'Medication Added',
        description: `${data.medicationName} has been added to your list.`
    });
    setIsSubmitting(false);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <AddRecordDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      trigger={children}
      title="Add New Medication"
      description="Enter the details of your new medication."
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <FormField
        control={form.control}
        name="medicationName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Medication Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Metformin" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
       <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Twice daily" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
    </AddRecordDialogLayout>
  );
}


'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { startOfDay } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AddRecordButton } from './add-record-button';
import { DatePicker } from './ui/date-picker';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(1, 'Value seems too low.').max(800, 'Value seems too high.'),
});

interface AddFastingBloodGlucoseRecordDialogProps {
    children?: React.ReactNode;
}

export function AddFastingBloodGlucoseRecordDialog({ children }: AddFastingBloodGlucoseRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addFastingBloodGlucoseRecord, biomarkerUnit, getDbGlucoseValue, profile } = useApp();
  const { toast } = useToast();
  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';


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
    try {
        addFastingBloodGlucoseRecord({
            date: startOfDay(data.date).toISOString(),
            value: getDbGlucoseValue(data.value),
        });
        toast({
            title: 'Success!',
            description: 'Your new Fasting Blood Glucose record has been added.',
        });
        setOpen(false);
    } catch (error) {
        console.error("Failed to add record", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your record."
        });
    } finally {
        setIsSubmitting(false);
    }
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

   const triggerButton = children || (
      <AddRecordButton tooltipContent="Add Fasting Blood Glucose Record" onClick={handleTriggerClick} />
   );


  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Fasting Blood Glucose Record</DialogTitle>
            <DialogDescription>Enter your value and the date it was measured.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                      <FormLabel>Fasting Blood Glucose ({unitLabel})</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder={unitLabel === 'mg/dL' ? 'e.g., 95' : 'e.g., 5.3'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
}

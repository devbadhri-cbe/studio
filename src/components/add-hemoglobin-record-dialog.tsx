
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
  value: z.coerce.number().min(1, 'Value seems too low.').max(250, 'Value seems too high.'),
});

interface AddHemoglobinRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}

export function AddHemoglobinRecordDialog({ children, onSuccess }: AddHemoglobinRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addHemoglobinRecord, getDbHemoglobinValue, biomarkerUnit } = useApp();
  const { toast } = useToast();
  const unitLabel = biomarkerUnit === 'si' ? 'g/L' : 'g/dL';

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
        addHemoglobinRecord({
            date: startOfDay(data.date).toISOString(),
            hemoglobin: getDbHemoglobinValue(data.value),
        });
        toast({
            title: 'Success!',
            description: 'Your new hemoglobin record has been added.',
        });
        setOpen(false);
        onSuccess?.();
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
  
   const triggerButton = children || (
      <AddRecordButton tooltipContent="Add Hemoglobin Record" />
   );


  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Hemoglobin Record</DialogTitle>
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
                      <FormLabel>Hemoglobin ({unitLabel})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder={unitLabel === 'g/dL' ? 'e.g., 13.5' : 'e.g., 135'} {...field} />
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

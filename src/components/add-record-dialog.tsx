
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { startOfDay, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { AddRecordButton } from './add-record-button';
import { DatePicker } from './ui/date-picker';
import { Loader2 } from 'lucide-react';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(1, 'Value is required.').max(25, 'Value seems too high.'),
});

interface AddRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}


export function AddRecordDialog({ children, onSuccess }: AddRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addHba1cRecord, hba1cRecords } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      value: '' as any,
      date: new Date(),
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        value: '' as any,
        date: new Date(),
      });
    }
  }, [open, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    const newDate = startOfDay(data.date);
    
    const dateExists = (hba1cRecords || []).some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A record for this date already exists. Please choose a different date.',
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
        addHba1cRecord({
          date: newDate.toISOString(),
          value: data.value,
        });
        toast({
          title: 'Success!',
          description: 'Your new HbA1c record has been added.',
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
      <AddRecordButton tooltipContent="Add HbA1c Record" />
   );

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New HbA1c Record</DialogTitle>
            <DialogDescription>Enter the details of your new lab result here.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HbA1c Result (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 5.7" {...field} />
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


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
import { DatePicker } from './ui/date-picker';
import { lbsToKg } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { AddRecordButton } from './add-record-button';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(2, 'Weight seems too low.').max(300, 'Weight seems too high.'),
});

interface AddWeightRecordDialogProps {
    children?: React.ReactNode;
}

export function AddWeightRecordDialog({ children }: AddWeightRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addWeightRecord, profile } = useApp();
  const { toast } = useToast();
  const dateInputRef = React.useRef<HTMLButtonElement>(null);
  const isImperial = profile.unitSystem === 'imperial';

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
      setTimeout(() => {
        dateInputRef.current?.focus();
      }, 100);
    }
  }, [open, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
        const dbValue = isImperial ? lbsToKg(data.value) : data.value;
        addWeightRecord({
            date: startOfDay(data.date).toISOString(),
            value: dbValue,
        });
        toast({
            title: 'Success!',
            description: 'Your new weight record has been added.',
        });
        setOpen(false);
    } catch (error) {
        console.error("Failed to add weight record", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your weight record."
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
   const triggerButton = children || (
      <AddRecordButton tooltipContent="Add Weight Record" />
   );


  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Weight Record</DialogTitle>
            <DialogDescription>Enter your weight and the date it was measured.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        ref={dateInputRef}
                        value={field.value}
                        onChange={field.onChange}
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
                      <FormLabel>Weight ({isImperial ? 'lbs' : 'kg'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder={isImperial ? "e.g., 154.5" : "e.g., 70.5"} {...field} />
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

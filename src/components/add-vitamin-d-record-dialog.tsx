
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { startOfDay, parseISO } from 'date-fns';

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

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(1, 'Value is required.'),
});

interface AddVitaminDRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}

export function AddVitaminDRecordDialog({ children, onSuccess }: AddVitaminDRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { addVitaminDRecord, vitaminDRecords, biomarkerUnit, getDbVitaminDValue } = useApp();
  const { toast } = useToast();

  const getUnitLabel = (unit: 'conventional' | 'si') => (unit === 'si' ? 'nmol/L' : 'ng/mL');

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
  }, [open, biomarkerUnit, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const newDate = startOfDay(data.date);
    
    const dateExists = vitaminDRecords.some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A Vitamin D record for this date already exists. Please choose a different date.',
      });
      return;
    }
    
    const dbValue = getDbVitaminDValue(data.value);

    addVitaminDRecord({
      date: newDate.toISOString(),
      value: dbValue,
    });
    toast({
      title: 'Success!',
      description: 'Your new Vitamin D record has been added.',
    });
    setOpen(false);
    onSuccess?.();
  };

  const triggerButton = children || <AddRecordButton tooltipContent="Add Vitamin D Record" />;

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
           {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Vitamin D Record</DialogTitle>
            <DialogDescription>Enter the details of your new Vitamin D result here.</DialogDescription>
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
                    <FormLabel>Vitamin D ({getUnitLabel(biomarkerUnit)})</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder={biomarkerUnit === 'si' ? "e.g., 75" : "e.g., 30"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Record</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
}

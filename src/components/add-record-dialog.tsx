
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { PlusCircle } from 'lucide-react';
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

const FormSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
  value: z.coerce.number().min(1, 'Value is required.').max(25, 'Value seems too high.'),
});

export function AddRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const { addRecord, records, profile } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      value: '' as any,
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    // Dates from the form are 'yyyy-MM-dd' strings, representing local dates.
    // Stored dates are ISO strings (UTC). We need to compare them consistently.
    const newDateString = data.date;
    const dateExists = records.some((record) => {
        // Parse the stored ISO string and format it to 'yyyy-MM-dd' in UTC to avoid timezone shifts.
        const storedDate = format(parseISO(record.date as string), 'yyyy-MM-dd');
        return storedDate === newDateString;
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A record for this date already exists. Please choose a different date.',
      });
      return;
    }
    
    addRecord({
      date: new Date(data.date).toISOString(),
      value: data.value,
    });
    toast({
      title: 'Success!',
      description: 'Your new HbA1c record has been added.',
    });
    setOpen(false);
    form.reset({
      value: '' as any,
      date: format(new Date(), 'yyyy-MM-dd'),
    });
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="h-9 gap-1" onClick={handleTriggerClick}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Record</span>
          </Button>
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
                  <FormItem>
                    <FormLabel>Test Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                <Button type="submit">Save Record</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

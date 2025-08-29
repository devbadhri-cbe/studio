
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format, parseISO, startOfDay } from 'date-fns';

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
  tsh: z.coerce.number().min(0, 'Value is required.'),
  t3: z.coerce.number().min(0, 'Value is required.'),
  t4: z.coerce.number().min(0, 'Value is required.'),
});

export function AddThyroidRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const { addThyroidRecord, profile, thyroidRecords } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: '',
      tsh: '' as any,
      t3: '' as any,
      t4: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        tsh: '' as any,
        t3: '' as any,
        t4: '' as any,
      });
    }
  }, [open, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const newDate = new Date(data.date + 'T00:00:00');

    const dateExists = thyroidRecords.some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A thyroid record for this date already exists. Please choose a different date.',
      });
      return;
    }
    
    addThyroidRecord({
      date: newDate.toISOString(),
      tsh: data.tsh,
      t3: data.t3,
      t4: data.t4,
    });
    toast({
      title: 'Success!',
      description: 'Your new thyroid record has been added.',
    });
    setOpen(false);
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
            <DialogTitle>Add New Thyroid Record</DialogTitle>
            <DialogDescription>Enter the details of your new thyroid panel result here.</DialogDescription>
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
                      <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                      <FormLabel>T3 (ng/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 150" {...field} />
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
                      <FormLabel>T4 (μg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

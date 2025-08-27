
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';

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
  systolic: z.coerce.number().min(50, 'Value seems too low.').max(300, 'Value seems too high.'),
  diastolic: z.coerce.number().min(30, 'Value seems too low.').max(200, 'Value seems too high.'),
});

export function AddBloodPressureRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const { addBloodPressureRecord, profile, bloodPressureRecords } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      systolic: '' as any,
      diastolic: '' as any,
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const newDate = new Date(data.date);
    const newDateString = newDate.toDateString();
    const dateExists = bloodPressureRecords.some((record) => new Date(record.date).toDateString() === newDateString);

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A blood pressure record for this date already exists. Please choose a different date.',
      });
      return;
    }
    
    addBloodPressureRecord({
      date: new Date(data.date).toISOString(),
      systolic: data.systolic,
      diastolic: data.diastolic,
    });
    toast({
      title: 'Success!',
      description: 'Your new blood pressure record has been added.',
    });
    setOpen(false);
    form.reset({
      date: format(new Date(), 'yyyy-MM-dd'),
      systolic: '' as any,
      diastolic: '' as any,
    });
  };
  
  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!profile.medication || profile.medication.length === 0) {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Medication Required',
        description: 'Please enter the current medication in the profile before adding a new record.',
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
            <DialogTitle>Add New Blood Pressure Record</DialogTitle>
            <DialogDescription>Enter your systolic and diastolic blood pressure readings.</DialogDescription>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="systolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systolic (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diastolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diastolic (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 80" {...field} />
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

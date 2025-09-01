
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
import { DateField } from './ui/date-field';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  sodium: z.coerce.number().min(100, 'Value seems too low.').max(200, 'Value seems too high.'),
  potassium: z.coerce.number().min(1, 'Value seems too low.').max(10, 'Value seems too high.'),
  chloride: z.coerce.number().min(70, 'Value seems too low.').max(130, 'Value seems too high.'),
  bicarbonate: z.coerce.number().min(10, 'Value seems too low.').max(40, 'Value seems too high.'),
});

export function AddElectrolyteRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const { addElectrolyteRecord, profile, electrolyteRecords } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      sodium: '' as any,
      potassium: '' as any,
      chloride: '' as any,
      bicarbonate: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        sodium: '' as any,
        potassium: '' as any,
        chloride: '' as any,
        bicarbonate: '' as any,
      });
    }
  }, [open, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const newDate = startOfDay(data.date);

    const dateExists = electrolyteRecords.some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'An electrolyte record for this date already exists. Please choose a different date.',
      });
      return;
    }
    
    addElectrolyteRecord({
      date: newDate.toISOString(),
      sodium: data.sodium,
      potassium: data.potassium,
      chloride: data.chloride,
      bicarbonate: data.bicarbonate,
    });
    toast({
      title: 'Success!',
      description: 'Your new electrolyte record has been added.',
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
           <AddRecordButton tooltipContent="Add Electrolyte Record" onClick={handleTriggerClick} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Electrolyte Record</DialogTitle>
            <DialogDescription>Enter your Sodium, Potassium, Chloride, and Bicarbonate values.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <DateField
                name="date"
                label="Test Date"
                control={form.control}
                fromYear={new Date().getFullYear() - 10}
                toYear={new Date().getFullYear()}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="sodium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sodium (mEq/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 140" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="potassium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potassium (mEq/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="chloride"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chloride (mEq/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 102" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="bicarbonate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bicarbonate (mEq/L)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 24" {...field} />
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

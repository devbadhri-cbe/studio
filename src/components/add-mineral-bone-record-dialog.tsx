
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
import { DatePicker } from './ui/date-picker';
import { AddRecordButton } from './add-record-button';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  calcium: z.coerce.number().min(1, 'Value seems too low.').max(20, 'Value seems too high.'),
  phosphorus: z.coerce.number().min(0, 'Value is required.').max(20, 'Value seems too high.'),
  pth: z.coerce.number().min(0, 'Value is required.').max(2000, 'Value seems too high.'),
});

export function AddMineralBoneRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const { addMineralBoneDiseaseRecord, profile, mineralBoneDiseaseRecords } = useApp();
  const { toast } = useToast();
  const dateInputRef = React.useRef<HTMLButtonElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      calcium: '' as any,
      phosphorus: '' as any,
      pth: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        calcium: '' as any,
        phosphorus: '' as any,
        pth: '' as any,
      });
      setTimeout(() => {
        dateInputRef.current?.focus();
      }, 100);
    }
  }, [open, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const newDate = startOfDay(data.date);

    const dateExists = mineralBoneDiseaseRecords.some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A record for this date already exists. Please choose a different date.',
      });
      return;
    }
    
    addMineralBoneDiseaseRecord({
      date: newDate.toISOString(),
      calcium: data.calcium,
      phosphorus: data.phosphorus,
      pth: data.pth,
    });
    toast({
      title: 'Success!',
      description: 'Your new mineral & bone record has been added.',
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
           <AddRecordButton tooltipContent="Add Mineral & Bone Record" onClick={handleTriggerClick} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Mineral & Bone Record</DialogTitle>
            <DialogDescription>Enter your Calcium, Phosphorus, and Parathyroid Hormone (PTH) values.</DialogDescription>
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
              <div className="grid grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="calcium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calcium (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 9.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phosphorus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phosphorus (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PTH (pg/mL)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50" {...field} />
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

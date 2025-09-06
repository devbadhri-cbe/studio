
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
import { Loader2 } from 'lucide-react';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  totalCholesterol: z.coerce.number().min(1, 'Value is required.'),
  ldl: z.coerce.number().min(1, 'Value is required.'),
  hdl: z.coerce.number().min(1, 'Value is required.'),
  triglycerides: z.coerce.number().min(1, 'Value is required.'),
});

interface AddLipidRecordDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}


export function AddLipidRecordDialog({ children, onSuccess }: AddLipidRecordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addLipidRecord, profile, lipidRecords } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      totalCholesterol: '' as any,
      ldl: '' as any,
      hdl: '' as any,
      triglycerides: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        totalCholesterol: '' as any,
        ldl: '' as any,
        hdl: '' as any,
        triglycerides: '' as any,
      });
    }
  }, [open, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    const newDate = startOfDay(data.date);

    const dateExists = lipidRecords.some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A lipid record for this date already exists. Please choose a different date.',
      });
      setIsSubmitting(false);
      return;
    }
    
    addLipidRecord({
      date: newDate.toISOString(),
      totalCholesterol: data.totalCholesterol,
      ldl: data.ldl,
      hdl: data.hdl,
      triglycerides: data.triglycerides,
    });
    toast({
      title: 'Success!',
      description: 'Your new lipid panel record has been added.',
    });
    setIsSubmitting(false);
    setOpen(false);
    onSuccess?.();
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

  const triggerButton = children || <AddRecordButton tooltipContent="Add Lipid Panel Record" onClick={handleTriggerClick} />;


  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lipid Panel Record</DialogTitle>
            <DialogDescription>Enter the details of your new lipid panel result here.</DialogDescription>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalCholesterol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Cholesterol (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="triglycerides"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Triglycerides (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ldl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LDL (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hdl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HDL (mg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

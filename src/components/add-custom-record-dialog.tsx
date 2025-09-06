
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
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { DatePicker } from './ui/date-picker';
import { CustomBiomarker } from '@/lib/types';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(0, 'Value cannot be negative.'),
  unit: z.string().optional(),
});

interface AddCustomRecordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    biomarker: CustomBiomarker;
}

export function AddCustomRecordDialog({ open, onOpenChange, biomarker }: AddCustomRecordDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { addCustomBiomarkerRecord } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { date: new Date(), value: '' as any, unit: '' },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ date: new Date(), value: '' as any, unit: '' });
    }
  }, [open, form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
        addCustomBiomarkerRecord(biomarker.id, {
            date: startOfDay(data.date).toISOString(),
            value: data.value,
            unit: data.unit,
        });
        toast({
            title: 'Success!',
            description: `New record for ${biomarker.name} has been added.`,
        });
        onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New {biomarker.name} Record</DialogTitle>
            <DialogDescription>Enter the value and the date it was measured.</DialogDescription>
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
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="e.g., 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., mg/dL, U/L" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
              <DialogFooter>
                 <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
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

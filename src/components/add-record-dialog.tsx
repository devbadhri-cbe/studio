'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  date: z.date({
    required_error: 'A date for the result is required.',
  }),
  value: z.coerce.number().min(1, 'Value is required.').max(25, 'Value seems too high.'),
});

export function AddRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const [showWarning, setShowWarning] = React.useState(false);
  const [formData, setFormData] = React.useState<z.infer<typeof FormSchema> | null>(null);
  const { addRecord, records } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      value: undefined,
      date: new Date(),
    },
  });

  const handleAddRecord = (data: z.infer<typeof FormSchema>) => {
    addRecord({
      date: data.date.toISOString(),
      value: data.value,
    });
    toast({
      title: 'Success!',
      description: 'Your new HbA1c record has been added.',
    });
    setOpen(false);
    form.reset();
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const newDateString = data.date.toDateString();
    const dateExists = records.some((record) => new Date(record.date).toDateString() === newDateString);

    if (dateExists) {
      setFormData(data);
      setShowWarning(true);
    } else {
      handleAddRecord(data);
    }
  }

  const handleConfirmOverwrite = () => {
    if (formData) {
      handleAddRecord(formData);
    }
    setShowWarning(false);
    setFormData(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1">
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Test Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                          >
                            {field.value ? format(field.value, 'dd-MM-yyyy') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Date Warning</AlertDialogTitle>
            <AlertDialogDescription>
              A record for this date already exists. Do you want to add this new record anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormData(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverwrite}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

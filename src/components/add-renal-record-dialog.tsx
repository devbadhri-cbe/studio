
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
import { Label } from './ui/label';
import { Switch } from './ui/switch';

type CreatinineUnit = 'mg/dL' | 'umol/L';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  serumCreatinine: z.coerce.number().min(0.1, 'Value seems too low.').max(20, 'Value seems too high.'),
  uacr: z.coerce.number().min(0, 'Value is required.').max(1000, 'Value seems too high.'),
});

export function AddRenalRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const { addRenalRecord, profile, renalRecords } = useApp();
  const { toast } = useToast();
  const dateInputRef = React.useRef<HTMLButtonElement>(null);
  const [inputUnit, setInputUnit] = React.useState<CreatinineUnit>('mg/dL');


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      serumCreatinine: '' as any,
      uacr: '' as any,
    },
  });
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        date: new Date(),
        serumCreatinine: '' as any,
        uacr: '' as any,
      });
      setTimeout(() => {
        dateInputRef.current?.focus();
      }, 100);
    }
  }, [open, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const newDate = startOfDay(data.date);

    const dateExists = renalRecords.some((record) => {
        const storedDate = startOfDay(parseISO(record.date as string));
        return storedDate.getTime() === newDate.getTime();
    });

    if (dateExists) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Entry',
        description: 'A renal record for this date already exists. Please choose a different date.',
      });
      return;
    }
    
    addRenalRecord({
      date: newDate.toISOString(),
      serumCreatinine: data.serumCreatinine,
      serumCreatinineUnits: inputUnit,
      uacr: data.uacr,
    });
    toast({
      title: 'Success!',
      description: 'Your new renal record has been added.',
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
           <AddRecordButton tooltipContent="Add Renal Record" onClick={handleTriggerClick} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Renal Record</DialogTitle>
            <DialogDescription>Enter your Serum Creatinine and UACR values.</DialogDescription>
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
              <FormField
                control={form.control}
                name="serumCreatinine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serum Creatinine</FormLabel>
                     <div className="flex items-center space-x-2">
                        <FormControl>
                            <Input type="number" step="0.01" placeholder={inputUnit === 'mg/dL' ? "e.g., 1.1" : "e.g., 97.2"} {...field} />
                        </FormControl>
                        <Switch
                            id="unit-switch"
                            checked={inputUnit === 'umol/L'}
                            onCheckedChange={(checked) => setInputUnit(checked ? 'umol/L' : 'mg/dL')}
                        />
                        <Label htmlFor="unit-switch" className="whitespace-nowrap">{inputUnit}</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uacr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UACR (mg/g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 15" {...field} />
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

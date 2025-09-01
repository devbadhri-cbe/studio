
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
import { toNgDl } from '@/lib/unit-conversions';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { AddRecordButton } from './add-record-button';
import { DateField } from './ui/date-field';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  value: z.coerce.number().min(1, 'Value is required.'),
});

type VitaminDUnit = 'conventional' | 'si';

export function AddVitaminDRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const { addVitaminDRecord, profile, vitaminDRecords, biomarkerUnit } = useApp();
  const { toast } = useToast();
  const [inputUnit, setInputUnit] = React.useState<VitaminDUnit>(biomarkerUnit);

  const getUnitLabel = (unit: VitaminDUnit) => (unit === 'si' ? 'nmol/L' : 'ng/mL');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      value: '' as any,
    },
  });

  React.useEffect(() => {
    if (open) {
      setInputUnit(biomarkerUnit);
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
    
    const dbValue = inputUnit === 'si' ? toNgDl(data.value) : data.value;

    addVitaminDRecord({
      date: newDate.toISOString(),
      value: dbValue,
    });
    toast({
      title: 'Success!',
      description: 'Your new Vitamin D record has been added.',
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
           <AddRecordButton tooltipContent="Add Vitamin D Record" onClick={handleTriggerClick} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Vitamin D Record</DialogTitle>
            <DialogDescription>Enter the details of your new Vitamin D result here.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
               <div className="flex items-center space-x-2">
                <Label htmlFor="unit-switch">ng/mL</Label>
                <Switch
                    id="unit-switch"
                    checked={inputUnit === 'si'}
                    onCheckedChange={(checked) => setInputUnit(checked ? 'si' : 'conventional')}
                />
                <Label htmlFor="unit-switch">nmol/L</Label>
              </div>
              <DateField
                name="date"
                label="Test Date"
                control={form.control}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vitamin D ({getUnitLabel(inputUnit)})</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder={inputUnit === 'si' ? "e.g., 75" : "e.g., 30"} {...field} />
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


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
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { toMgDl } from '@/lib/unit-conversions';
import { AddRecordButton } from './add-record-button';
import { DatePicker } from './ui/date-picker';

const FormSchema = z.object({
  date: z.date({ required_error: 'A valid date is required.' }),
  ldl: z.coerce.number().min(0.1, 'Value is required.'),
  hdl: z.coerce.number().min(0.1, 'Value is required.'),
  triglycerides: z.coerce.number().min(0.1, 'Value is required.'),
  total: z.coerce.number().min(0.1, 'Value is required.'),
});

type LipidUnit = 'conventional' | 'si';

export function AddLipidRecordDialog() {
  const [open, setOpen] = React.useState(false);
  const { addLipidRecord, profile, lipidRecords, biomarkerUnit } = useApp();
  const { toast } = useToast();
  const [inputUnit, setInputUnit] = React.useState<LipidUnit>(biomarkerUnit);

  const getUnitLabel = (unit: LipidUnit) => (unit === 'si' ? 'mmol/L' : 'mg/dL');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: new Date(),
      ldl: '' as any,
      hdl: '' as any,
      triglycerides: '' as any,
      total: '' as any,
    },
  });

  React.useEffect(() => {
    if (open) {
      setInputUnit(biomarkerUnit);
      form.reset({
        date: new Date(),
        ldl: '' as any,
        hdl: '' as any,
        triglycerides: '' as any,
        total: '' as any,
      });
    }
  }, [open, biomarkerUnit, form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
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
      return;
    }
    
    // Convert values to mg/dL for storage if input was in SI units
    const dbRecord = {
        date: newDate.toISOString(),
        ldl: inputUnit === 'si' ? toMgDl(data.ldl, 'ldl') : data.ldl,
        hdl: inputUnit === 'si' ? toMgDl(data.hdl, 'hdl') : data.hdl,
        triglycerides: inputUnit === 'si' ? toMgDl(data.triglycerides, 'triglycerides') : data.triglycerides,
        total: inputUnit === 'si' ? toMgDl(data.total, 'total') : data.total,
    }

    addLipidRecord(dbRecord);

    toast({
      title: 'Success!',
      description: 'Your new lipid record has been added.',
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
          <AddRecordButton tooltipContent="Add Lipid Record" onClick={handleTriggerClick} />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Lipid Record</DialogTitle>
            <DialogDescription>Enter the details of your new lipid panel result here.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="unit-switch">mg/dL</Label>
                <Switch
                    id="unit-switch"
                    checked={inputUnit === 'si'}
                    onCheckedChange={(checked) => setInputUnit(checked ? 'si' : 'conventional')}
                />
                <Label htmlFor="unit-switch">mmol/L</Label>
              </div>
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
                  name="ldl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LDL ({getUnitLabel(inputUnit)})</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder={inputUnit === 'si' ? "e.g., 2.6" : "e.g., 100"} {...field} />
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
                      <FormLabel>HDL ({getUnitLabel(inputUnit)})</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder={inputUnit === 'si' ? "e.g., 1.3" : "e.g., 50"} {...field} />
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
                      <FormLabel>Triglycerides ({getUnitLabel(inputUnit)})</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder={inputUnit === 'si' ? "e.g., 1.7" : "e.g., 150"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total ({getUnitLabel(inputUnit)})</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder={inputUnit === 'si' ? "e.g., 5.2" : "e.g., 200"} {...field} />
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

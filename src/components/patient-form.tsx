'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { parseISO } from 'date-fns';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { countries } from '@/lib/countries';
import type { Patient } from '@/lib/types';
import { FormActions } from './form-actions';
import { cmToFtIn } from '@/lib/utils';
import { DateInput } from './date-input';

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  dob: z.date({ required_error: 'A date of birth is required.' }),
  gender: z.enum(['male', 'female'], { required_error: "Please select a gender." }),
  country: z.string().min(1, { message: "Please select a country." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  height: z.string().optional(),
  height_ft: z.string().optional(),
  height_in: z.string().optional(),
});

export type PatientFormData = z.infer<typeof FormSchema>;

interface PatientFormProps {
    onSubmit: (data: PatientFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    initialData?: Patient | null;
}

export function PatientForm({ onSubmit, onCancel, isSubmitting, initialData }: PatientFormProps) {
  const formMethods = useForm<PatientFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: React.useMemo(() => {
        const isImperial = countries.find(c => c.code === initialData?.country)?.unitSystem === 'imperial';
        let height_ft = '';
        let height_in = '';
        if(initialData?.height && isImperial) {
            const { feet, inches } = cmToFtIn(initialData.height);
            height_ft = feet.toString();
            height_in = Math.round(inches).toString();
        }

        return {
            name: initialData?.name || '',
            dob: initialData?.dob ? parseISO(initialData.dob) : new Date(),
            gender: initialData?.gender,
            email: initialData?.email || '',
            country: initialData?.country || '',
            phone: initialData?.phone || '',
            height: !isImperial ? (initialData?.height?.toString() || '') : '',
            height_ft: isImperial ? height_ft : '',
            height_in: isImperial ? height_in : '',
        }
    }, [initialData])
  });
  
  const watchCountry = formMethods.watch('country');
  const countryInfo = React.useMemo(() => countries.find(c => c.code === watchCountry), [watchCountry]);
  const isImperial = countryInfo?.unitSystem === 'imperial';
  const phoneCode = countryInfo?.phoneCode;
  
  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6 border-2 border-red-500 p-2">
        <FormField
          control={formMethods.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DateInput
            name="dob"
            label="Date of Birth"
            fromYear={new Date().getFullYear() - 120}
            toYear={new Date().getFullYear()}
        />

        <FormField
            control={formMethods.control}
            name="gender"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <FormField
          control={formMethods.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper">
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isImperial ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={formMethods.control} name="height_ft" render={({ field }) => ( <FormItem><FormLabel>Height (ft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value || ''} autoComplete="off"/></FormControl><FormMessage /></FormItem> )} />
            <FormField control={formMethods.control} name="height_in" render={({ field }) => ( <FormItem><FormLabel>Height (in)</FormLabel><FormControl><Input type="number" placeholder="e.g., 9" {...field} value={field.value || ''} autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
          </div>
        ) : (
          <FormField control={formMethods.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} value={field.value || ''} autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <FormField
            control={formMethods.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <div className="flex items-center">
                  {phoneCode && (
                    <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">
                      {phoneCode}
                    </span>
                  )}
                  <FormControl>
                    <Input
                      type="tel"
                      {...field}
                      value={field.value || ''}
                      autoComplete="off"
                      className={phoneCode ? 'rounded-l-none' : ''}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={formMethods.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="patient@example.com" {...field} value={field.value || ''} autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
        </div>

        <FormActions
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
}

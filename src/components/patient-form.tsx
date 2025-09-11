
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { countries } from '@/lib/countries';
import { Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import type { Patient } from '@/lib/types';
import { parseISO } from 'date-fns';
import { calculateAge, cmToFtIn } from '@/lib/utils';
import { DatePicker } from './ui/date-picker';
import { useApp } from '@/context/app-context';


export type PatientFormData = {
  name: string;
  dob: Date;
  gender: 'male' | 'female';
  email?: string;
  country: string;
  phone?: string;
  height: string;
  height_ft: string;
  height_in: string;
};

interface PatientFormProps {
    patient?: Patient;
    onSubmit: (data: PatientFormData) => void;
    isSubmitting: boolean;
    onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, isSubmitting, onCancel }: PatientFormProps) {
  const { profile } = useApp();
  const [selectedCountry, setSelectedCountry] = React.useState(patient?.country || '');
  const isImperial = countries.find(c => c.code === selectedCountry)?.unitSystem === 'imperial';
  
  const form = useForm<PatientFormData>({
    defaultValues: React.useMemo(() => {
        let height_ft = '';
        let height_in = '';
        if(patient?.height && isImperial) {
            const { feet, inches } = cmToFtIn(patient.height);
            height_ft = feet.toString();
            height_in = Math.round(inches).toString();
        }

        return {
            name: patient?.name || '',
            dob: patient?.dob ? parseISO(patient.dob) : new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
            gender: patient?.gender as 'male' | 'female' | undefined,
            email: patient?.email || '',
            country: patient?.country || '',
            phone: patient?.phone || '',
            height: !isImperial ? (patient?.height?.toString() || '') : '',
            height_ft: isImperial ? height_ft : '',
            height_in: isImperial ? height_in : '',
        }
    }, [patient, isImperial])
  });

  const watchDob = form.watch('dob');
  const watchCountry = form.watch('country');
  const age = React.useMemo(() => watchDob ? calculateAge(watchDob.toISOString()) : null, [watchDob]);
  
  React.useEffect(() => {
    setSelectedCountry(watchCountry);
  }, [watchCountry]);

  React.useEffect(() => {
    form.reset({
        name: patient?.name || '',
        dob: patient?.dob ? parseISO(patient.dob) : new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
        gender: patient?.gender as 'male' | 'female' | undefined,
        email: patient?.email || '',
        country: patient?.country || '',
        phone: patient?.phone || '',
        height: !isImperial ? (patient?.height?.toString() || '') : '',
        height_ft: isImperial ? (patient?.height ? cmToFtIn(patient.height).feet.toString() : '') : '',
        height_in: isImperial ? (patient?.height ? Math.round(cmToFtIn(patient.height).inches).toString() : '') : '',
    });
  }, [patient, form, isImperial]);
  
  return (
    <>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter patient's full name" {...field} disabled={!!patient} /></FormControl><FormMessage /></FormItem> )} />
            
             <FormField
              control={form.control}
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

            {patient?.id && (
                <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl>
                        <Input readOnly value={patient.id} />
                    </FormControl>
                </FormItem>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <DatePicker
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

                <div className="md:col-span-2">
                     {isImperial ? (
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="height_ft" render={({ field }) => ( <FormItem><FormLabel>Height (ft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="height_in" render={({ field }) => ( <FormItem><FormLabel>Height (in)</FormLabel><FormControl><Input type="number" placeholder="e.g., 9" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                    ) : (
                        <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                    )}
                </div>

                <Separator className="md:col-span-2" />

                
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                <div className="md:col-span-2">
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="patient@example.com" {...field} value={field.value || ''} autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
                </div>
            </div>

             <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                </Button>
            </div>
        </form>
    </Form>
    </>
  );
}

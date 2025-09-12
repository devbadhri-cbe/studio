'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { countries } from '@/lib/countries';
import { Separator } from './ui/separator';
import type { Patient } from '@/lib/types';
import { parseISO } from 'date-fns';
import { calculateAge, cmToFtIn } from '@/lib/utils';
import { DatePicker } from './ui/date-picker';
import { FormActions } from './form-actions';


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
    patient?: Patient | null;
    onSubmit: (data: PatientFormData) => void;
    isSubmitting: boolean;
    onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, isSubmitting, onCancel }: PatientFormProps) {
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    // Automatically focus the name input when the form loads
    setTimeout(() => {
        nameInputRef.current?.focus();
    }, 100);
  }, []);
  
  const form = useForm<PatientFormData>({
    defaultValues: React.useMemo(() => {
        const isImperial = countries.find(c => c.code === patient?.country)?.unitSystem === 'imperial';
        let height_ft = '';
        let height_in = '';
        if(patient?.height && isImperial) {
            const { feet, inches } = cmToFtIn(patient.height);
            height_ft = feet.toString();
            height_in = Math.round(inches).toString();
        }

        return {
            name: (patient?.name === 'User' || !patient?.name) ? '' : patient.name,
            dob: patient?.dob ? parseISO(patient.dob) : new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
            gender: patient?.gender as 'male' | 'female' | undefined,
            email: patient?.email || '',
            country: patient?.country || '',
            phone: patient?.phone || '',
            height: !isImperial ? (patient?.height?.toString() || '') : '',
            height_ft: isImperial ? height_ft : '',
            height_in: isImperial ? height_in : '',
        }
    }, [patient])
  });

  const watchDob = form.watch('dob');
  const watchCountry = form.watch('country');
  const age = React.useMemo(() => watchDob ? calculateAge(watchDob.toISOString()) : null, [watchDob]);
  
  const countryInfo = React.useMemo(() => countries.find(c => c.code === watchCountry), [watchCountry]);
  const isImperial = countryInfo?.unitSystem === 'imperial';
  const phoneCode = countryInfo?.phoneCode;


  const handleFormSubmit = (data: PatientFormData) => {
    onSubmit(data);
  };
  
  return (
    <>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} ref={nameInputRef} autoComplete="off" />
                  </FormControl>
                  <FormDescription>
                    Your name is used by the AI to verify ownership of uploaded lab reports.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                                    fromYear={new Date().getFullYear() - 120}
                                    toYear={new Date().getFullYear()}
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
                            <FormField control={form.control} name="height_ft" render={({ field }) => ( <FormItem><FormLabel>Height (ft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value || ''} autoComplete="off"/></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="height_in" render={({ field }) => ( <FormItem><FormLabel>Height (in)</FormLabel><FormControl><Input type="number" placeholder="e.g., 9" {...field} value={field.value || ''} autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                    ) : (
                        <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} value={field.value || ''} autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
                    )}
                </div>

                <Separator className="md:col-span-2" />

                
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <FormField
                        control={form.control}
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
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="patient@example.com" {...field} value={field.value || ''} autoComplete="off" /></FormControl><FormMessage /></FormItem> )} />
                </div>
            </div>

            <FormActions
              onCancel={onCancel}
              isSubmitting={isSubmitting}
            />
        </form>
    </Form>
    </>
  );
}

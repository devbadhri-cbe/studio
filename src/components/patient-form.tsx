
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
import { calculateAge, formatDisplayPhoneNumber } from '@/lib/utils';
import { DatePicker } from './ui/date-picker';


export type PatientFormData = {
  name: string;
  dob: Date;
  gender: 'male' | 'female' | 'other';
  email?: string;
  country: string;
  phone?: string;
};

interface PatientFormProps {
    patient?: Patient;
    onSubmit: (data: PatientFormData) => void;
    isSubmitting: boolean;
    onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, isSubmitting, onCancel }: PatientFormProps) {
  
  const form = useForm<PatientFormData>({
    defaultValues: {
      name: '',
      dob: undefined,
      gender: undefined,
      email: '',
      country: '',
      phone: '',
    },
  });
  
  const watchDob = form.watch('dob');
  const watchCountry = form.watch('country');
  const age = React.useMemo(() => watchDob ? calculateAge(watchDob.toISOString()) : null, [watchDob]);

  React.useEffect(() => {
    if (patient) {
        let countryCode = patient.country || '';
        // If country is not set, try to infer it from the phone number
        if (!countryCode && patient.phone) {
            const matchedCountry = countries.find(c => patient.phone?.startsWith(c.phoneCode));
            if (matchedCountry) {
                countryCode = matchedCountry.code;
            }
        }
        
        form.reset({
            name: patient.name || '',
            dob: patient.dob ? parseISO(patient.dob) : new Date(),
            gender: patient.gender || undefined,
            email: patient.email || '',
            country: countryCode,
            phone: patient.phone || '',
        });
    }
  }, [patient, form]);

  React.useEffect(() => {
    const currentPhoneValue = form.getValues('phone');
    // Only set the phone code if we are creating a new patient (no patient.phone) AND the field is empty
    if (watchCountry && !patient?.phone && !currentPhoneValue) {
      const selectedCountry = countries.find(c => c.code === watchCountry);
      if (selectedCountry) {
        form.setValue('phone', selectedCountry.phoneCode, { shouldValidate: true });
      }
    }
  }, [watchCountry, form, patient?.phone]);
  
  const displayPhone = React.useMemo(() => {
      const phoneValue = form.watch('phone');
      const countryValue = form.watch('country');
      return formatDisplayPhoneNumber(phoneValue, countryValue);
  }, [form.watch('phone'), form.watch('country')]);


  return (
    <>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter patient's full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
            
            {patient?.id && (
                <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl>
                        <Input readOnly value={patient.id} />
                    </FormControl>
                </FormItem>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded-md items-start">
                 <div className="md:col-span-2">
                    <FormLabel>Date of Birth</FormLabel>
                    <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem>
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
                 </div>
                 <div>
                     <FormLabel>Age</FormLabel>
                     <FormField
                        name="age"
                        render={() => (
                             <FormItem>
                                <FormControl>
                                    <Input readOnly value={age !== null ? `${age} years` : ''} placeholder="Age" />
                                </FormControl>
                             </FormItem>
                        )}
                     />
                 </div>
                <div className="md:col-span-2">
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 h-10 w-full">
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <Separator />
            
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
                        <SelectContent>
                        {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField 
                control={form.control} 
                name="phone" 
                render={({ field }) => ( 
                    <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem> 
                )} 
            />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="patient@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />

             <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Close</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Patient
                </Button>
            </div>
        </form>
    </Form>
    </>
  );
}

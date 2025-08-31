
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { countries } from '@/lib/countries';
import { Loader2, UserPlus, X } from 'lucide-react';
import { Separator } from './ui/separator';
import type { Patient } from '@/lib/types';
import { DatePicker } from './ui/date-picker';
import { parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { calculateAge } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';


const FormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  dob: z.date({ required_error: "A valid date of birth is required." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  country: z.string().min(1, { message: "Country is required." }),
  phone: z.string().min(5, { message: "Phone number is too short." }).optional().or(z.literal('')),
});

export type PatientFormData = z.infer<typeof FormSchema>;

interface PatientFormProps {
    patient?: Patient;
    onSubmit: (data: PatientFormData) => void;
    isSubmitting: boolean;
    onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, isSubmitting, onCancel }: PatientFormProps) {
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      dob: undefined,
      gender: undefined,
      email: '',
      country: '',
      phone: '',
    },
  });
  
  const isMobile = useIsMobile();
  const watchCountry = form.watch('country');
  const watchDob = form.watch('dob');
  const age = React.useMemo(() => calculateAge(watchDob?.toISOString()), [watchDob]);

  React.useEffect(() => {
    if (patient) {
        form.reset({
            name: patient.name || '',
            dob: patient.dob ? parseISO(patient.dob) : new Date(),
            gender: patient.gender || undefined,
            email: patient.email || '',
            country: patient.country || '',
            phone: patient.phone || '',
        });
    }
  }, [patient, form]);

  React.useEffect(() => {
    if (watchCountry) {
        const countryData = countries.find(c => c.code === watchCountry);
        const currentPhone = form.getValues('phone');
        if (countryData && (!currentPhone || currentPhone.startsWith('+'))) {
             form.setValue('phone', countryData.phoneCode, { shouldValidate: false });
        }
    }
  }, [watchCountry, form]);
  
  return (
    <>
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter patient's full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormItem>
                     <FormLabel>Date of Birth</FormLabel>
                     <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormControl>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    fromYear={new Date().getFullYear() - 120}
                                    toYear={new Date().getFullYear()}
                                />
                            </FormControl>
                        )}
                    />
                    <FormMessage className="pt-1" />
                </FormItem>
                 <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                        <Input readOnly value={age !== null ? `${age} years` : ''} placeholder="Age" />
                    </FormControl>
                </FormItem>
                 <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 h-10 pt-2">
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="male" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Male</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="female" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Female</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="other" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Other</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
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


'use client';

import * as React from 'react';
import type { Patient } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { countries } from '@/lib/countries';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { format } from 'date-fns';

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid date is required." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  country: z.string().min(1, { message: "Country is required." }),
  phone: z.string().min(5, { message: "Phone number is too short." }),
  // Imperial units
  height_ft: z.coerce.number().optional().or(z.literal('')),
  height_in: z.coerce.number().optional().or(z.literal('')),
  weight_lbs: z.coerce.number().optional().or(z.literal('')),
  // Metric units
  height_cm: z.coerce.number().optional().or(z.literal('')),
  weight_kg: z.coerce.number().optional().or(z.literal('')),
});

interface PatientFormProps {
    patient?: Patient;
    onSave: (patient: Partial<Patient> & { weight?: number | string }, patientId?: string) => Promise<void>;
    onCancel: () => void;
}

const formatPhoneNumber = (phone: string, countryCode: string): string => {
    const country = countries.find(c => c.code === countryCode);
    if (!phone || !country) return phone;

    const phoneDigits = phone.replace(/\D/g, '');
    const countryPhoneCodeDigits = country.phoneCode.replace(/\D/g, '');
    
    const phoneWithoutCountryCode = phoneDigits.startsWith(countryPhoneCodeDigits)
        ? phoneDigits.substring(countryPhoneCodeDigits.length)
        : phoneDigits;

    switch (countryCode) {
        case 'US':
        case 'CA':
            if (phoneWithoutCountryCode.length === 10) {
                return `(${phoneWithoutCountryCode.substring(0, 3)}) ${phoneWithoutCountryCode.substring(3, 6)}-${phoneWithoutCountryCode.substring(6)}`;
            }
            break;
        case 'IN':
             if (phoneWithoutCountryCode.length === 10) {
                return `+91 ${phoneWithoutCountryCode.substring(0, 5)} ${phoneWithoutCountryCode.substring(5)}`;
            }
            break;
        default:
            return `${country.phoneCode} ${phoneWithoutCountryCode}`;
    }
    
    return phone;
}

const lbsToKg = (lbs: number) => lbs * 0.453592;
const kgToLbs = (kg: number) => kg / 0.453592;
const ftInToCm = (ft: number, inches: number) => (ft * 12 + inches) * 2.54;
const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
};


export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [unitSystem, setUnitSystem] = React.useState<'metric' | 'imperial'>('metric');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      dob: '',
      gender: undefined,
      email: '',
      country: '',
      phone: '',
      height_cm: '',
      weight_kg: '',
      height_ft: '',
      height_in: '',
      weight_lbs: '',
    },
  });
  
  const watchCountry = form.watch('country');

  React.useEffect(() => {
    if (watchCountry) {
        const countryData = countries.find(c => c.code === watchCountry);
        const currentPhone = form.getValues('phone');
        if (countryData && (!currentPhone || !countries.some(c => currentPhone.startsWith(c.phoneCode)))) {
             form.setValue('phone', countryData.phoneCode, { shouldValidate: false });
        }
        setUnitSystem(countryData?.unitSystem || 'metric');
    }
  }, [watchCountry, form]);
  
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    let heightInCm = data.height_cm;
    if (unitSystem === 'imperial' && data.height_ft) {
        heightInCm = ftInToCm(Number(data.height_ft) || 0, Number(data.height_in) || 0);
    }

    let weightInKg = data.weight_kg;
    if (unitSystem === 'imperial' && data.weight_lbs) {
        weightInKg = lbsToKg(Number(data.weight_lbs) || 0);
    }

    const patientDataToSave = {
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        email: data.email,
        country: data.country,
        phone: data.phone,
        height: heightInCm,
        weight: weightInKg,
    };
    await onSave(patientDataToSave, patient?.id);
    setIsSubmitting(false);
  };
  
  React.useEffect(() => {
    const countryData = countries.find(c => c.code === patient?.country);
    setUnitSystem(countryData?.unitSystem || 'metric');
    
    let height_cm = patient?.height || '';
    let weight_kg = patient?.weightRecords?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.value || '';
    let height_ft = '';
    let height_in = '';
    let weight_lbs = '';

    if (countryData?.unitSystem === 'imperial') {
        if (patient?.height) {
            const { feet, inches } = cmToFtIn(patient.height);
            height_ft = feet.toString();
            height_in = inches.toString();
        }
        if (weight_kg) {
            weight_lbs = Math.round(kgToLbs(Number(weight_kg))).toString();
        }
    }


    form.reset({
        name: patient?.name || '',
        dob: patient?.dob ? format(new Date(patient.dob), 'yyyy-MM-dd') : '',
        gender: patient?.gender || undefined,
        email: patient?.email || '',
        country: patient?.country || '',
        phone: patient?.phone || '',
        height_cm: height_cm.toString(),
        weight_kg: '', // Always clear weight field for new entry
        height_ft: height_ft,
        height_in: height_in,
        weight_lbs: '', // Always clear weight field for new entry
    });
  }, [patient, form]);

  const handlePhoneBlur = () => {
    const currentPhone = form.getValues('phone');
    const currentCountry = form.getValues('country');
    if(currentPhone && currentCountry) {
        const formatted = formatPhoneNumber(currentPhone, currentCountry);
        form.setValue('phone', formatted, { shouldValidate: true });
    }
  }

  return (
    <div className="flex-1 min-h-0">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                <ScrollArea className="flex-1">
                    <div className="space-y-6 p-4 sm:p-6">
                        <div className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter patient's full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <FormField control={form.control} name="dob" render={({ field }) => ( <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" placeholder="YYYY-MM-DD" {...field} /></FormControl><FormMessage /></FormItem> )} />
                               <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a gender" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="male">Male</SelectItem>
                                          <SelectItem value="female">Female</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                        </div>

                         <Separator />

                        <div className="space-y-4">
                             <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} onBlur={handlePhoneBlur} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="patient@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>

                        <Separator />
                        
                        {unitSystem === 'metric' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="height_cm" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="weight_kg" render={({ field }) => ( <FormItem><FormLabel>Current Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FormLabel>Height (ft, in)</FormLabel>
                                    <div className="flex gap-2 mt-2">
                                        <FormField control={form.control} name="height_ft" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input type="number" placeholder="ft" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                        <FormField control={form.control} name="height_in" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input type="number" placeholder="in" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    </div>
                                </div>
                                <FormField control={form.control} name="weight_lbs" render={({ field }) => ( <FormItem><FormLabel>Current Weight (lbs)</FormLabel><FormControl><Input type="number" placeholder="e.g., 154" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </div>
                        )}
                    </div>
                </ScrollArea>
                 <div className="flex justify-end gap-2 p-4 border-t">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {patient ? 'Save Changes' : 'Add Patient'}
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}


'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { calculateAge } from '@/lib/utils';
import type { Patient } from '@/lib/types';
import { countries } from '@/lib/countries';

const FormSchema = z.object({
  name: z.string().min(2, 'Patient name is required.'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required.' }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required.'),
  phone: z.string().min(5, 'A valid phone number is required.'),
  height: z.coerce.number().min(50, 'Height must be at least 50cm.').optional(),
  weight: z.coerce.number().min(2, 'Weight must be at least 2kg.').optional(),
}).refine((data) => data.email || data.phone, {
    message: "Either email or phone number is required.",
    path: ["email"],
});


type PatientFormData = Omit<Patient, 'id' | 'lastHba1c' | 'lastLipid' | 'status' | 'records' | 'lipidRecords' | 'medication' | 'presentMedicalConditions' | 'vitaminDRecords' | 'lastVitaminD' | 'thyroidRecords' | 'lastThyroid' | 'weightRecords' | 'bloodPressureRecords' | 'lastBloodPressure'>

interface PatientFormDialogProps {
    patient?: Patient;
    onSave: (patient: PatientFormData, patientId?: string) => void;
    children: React.ReactNode | ((props: { openDialog: () => void }) => React.ReactNode);
}

export function PatientFormDialog({ patient, onSave, children }: PatientFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const isEditMode = !!patient;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: isEditMode ? {
      name: patient.name,
      gender: patient.gender,
      dob: patient.dob,
      email: patient.email,
      country: patient.country,
      phone: patient.phone,
      height: patient.height,
      weight: patient.weightRecords?.[0]?.value,
    } : {
      name: '',
      dob: '',
      email: '',
      country: '',
      phone: '',
      height: undefined,
      weight: undefined
    },
  });
  
  const selectedCountryCode = form.watch('country');
  const currentPhoneNumber = form.watch('phone');

  React.useEffect(() => {
    if (selectedCountryCode) {
        const country = countries.find(c => c.code === selectedCountryCode);
        if (country) {
            const countryCode = country.phoneCode;
            // Only set the country code if the field is empty or doesn't already start with a plausible country code
            if (!currentPhoneNumber || !currentPhoneNumber.startsWith('+')) {
                 form.setValue('phone', countryCode, { shouldValidate: true });
            } else {
                // If the user changes country, update the country code prefix
                const oldCodeMatch = currentPhoneNumber.match(/^\+\d+/);
                if (oldCodeMatch && oldCodeMatch[0] !== countryCode) {
                    const numberWithoutCode = currentPhoneNumber.substring(oldCodeMatch[0].length).trim();
                    form.setValue('phone', `${countryCode} ${numberWithoutCode}`, { shouldValidate: true });
                }
            }
        }
    }
  }, [selectedCountryCode, form, currentPhoneNumber]);
  
  React.useEffect(() => {
    if (open) {
        if (isEditMode) {
             form.reset({
                name: patient.name,
                gender: patient.gender,
                dob: patient.dob,
                email: patient.email,
                country: patient.country,
                phone: patient.phone,
                height: patient.height,
                weight: patient.weightRecords && patient.weightRecords.length > 0
                  ? [...patient.weightRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value
                  : undefined,
            });
        } else {
            form.reset({
                name: '',
                gender: undefined,
                dob: '',
                email: '',
                country: '',
                phone: '',
                height: undefined,
                weight: undefined,
            });
        }
    }
  }, [open, form, isEditMode, patient]);
  
  const dobValue = form.watch('dob');
  const calculatedAge = calculateAge(dobValue);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    
    const submissionData: any = {
        ...data,
        email: data.email || '',
        phone: data.phone || '',
    };

    if (data.weight) {
        submissionData.weightRecords = [{
            id: 'initial',
            date: new Date().toISOString(),
            value: data.weight
        }];
    }
    
    setTimeout(() => {
        onSave(submissionData, patient?.id);
        toast({
            title: isEditMode ? 'Patient Updated' : 'Patient Added',
            description: `${data.name}'s details have been ${isEditMode ? 'updated' : 'added'}.`,
        });
        setIsSubmitting(false);
        setOpen(false);
    }, 1000);
  };

  const openDialog = () => setOpen(true);

  return (
      <Dialog open={open} onOpenChange={setOpen}>
         {typeof children === 'function' ? (
            children({ openDialog })
        ) : (
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Patient Details' : 'Add New Patient'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the patient's profile information." : "Enter the new patient's details to create their profile."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      {calculatedAge !== null && <FormDescription className='text-xs'>{calculatedAge} years old</FormDescription>}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 175" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.1" placeholder="e.g., 70" {...field} />
                            </FormControl>
                             <FormDescription className='text-xs'>This will create a new weight record.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
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
                        <Input type="tel" placeholder="Select a country first" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <DialogFooter>
                 <Button type="submit" disabled={isSubmitting} size="sm">
                    {isSubmitting ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                        </>
                    ) : (
                        isEditMode ? 'Save Changes' : 'Add Patient'
                    )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
}

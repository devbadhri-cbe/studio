
'use client';

import * as React from 'react';
import type { Patient } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid date is required." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  country: z.string().min(1, { message: "Country is required." }),
  phone: z.string().min(5, { message: "Phone number is too short." }),
  height: z.coerce.number().min(50, 'Height must be at least 50cm.').optional(),
  weight: z.coerce.number().min(2, 'Weight must be at least 2kg.').optional(),
});


interface PatientFormDialogProps {
    patient?: Patient;
    onSave: (patient: Partial<Patient> & { weight?: number }, patientId?: string) => void;
    children: React.ReactNode | ((props: { openDialog: () => void }) => React.ReactNode);
}

export function PatientFormDialog({ patient, onSave, children }: PatientFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: patient?.name || '',
      dob: patient?.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
      gender: patient?.gender || undefined,
      email: patient?.email || '',
      country: patient?.country || '',
      phone: patient?.phone || '',
      height: patient?.height || undefined,
      weight: undefined,
    },
  });

  const watchCountry = form.watch('country');

  React.useEffect(() => {
    if (watchCountry) {
        const countryData = countries.find(c => c.code === watchCountry);
        const currentPhone = form.getValues('phone');
        if (countryData && (!currentPhone || !countries.some(c => currentPhone.startsWith(c.phoneCode)))) {
             form.setValue('phone', countryData.phoneCode, { shouldValidate: !!currentPhone && currentPhone.length >= 5 });
        }
    }
  }, [watchCountry, form]);
  
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    // This now correctly only includes the fields in the simplified form
    const patientDataToSave = {
        id: patient?.id,
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        email: data.email,
        country: data.country,
        phone: data.phone,
        height: data.height,
        weight: data.weight,
        medication: patient?.medication || [],
        presentMedicalConditions: patient?.presentMedicalConditions || [],
    };
    await onSave(patientDataToSave, patient?.id);
    setIsSubmitting(false);
    setOpen(false);
  };
  
  React.useEffect(() => {
      if (!open) {
          form.reset({
            name: patient?.name || '',
            dob: patient?.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
            gender: patient?.gender || undefined,
            email: patient?.email || '',
            country: patient?.country || '',
            phone: patient?.phone || '',
            height: patient?.height || undefined,
            weight: undefined,
          });
      }
  }, [open, patient, form]);

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
      <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{patient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
          <DialogDescription>
            Fill out the form below to {patient ? 'update the patient\'s details' : 'add a new patient'}.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4">
              <Form {...form}>
                <form id="patient-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter patient's full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="dob" render={({ field }) => ( <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-2 pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
                    </div>
                    
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="patient@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Current Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                </form>
              </Form>
            </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="patient-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {patient ? 'Save Changes' : 'Add Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

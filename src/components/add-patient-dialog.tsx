
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

const FormSchema = z.object({
  name: z.string().min(2, 'Patient name is required.'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required.' }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required.').refine(val => /^\+\d{1,15}$/.test(val), 'Please enter a valid international phone number (e.g., +14155552671).'),
}).refine((data) => data.email || data.phone, {
    message: "Either email or phone number is required.",
    path: ["email"], // you can use any path here, as the message is general
});


type PatientFormData = Omit<Patient, 'id' | 'lastHba1c' | 'lastLipid' | 'status' | 'records' | 'lipidRecords' | 'medication' | 'presentMedicalConditions'>

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
      phone: patient.phone || '+'
    } : {
      name: '',
      dob: '',
      email: '',
      phone: '+',
    },
  });
  
  React.useEffect(() => {
    if (open && isEditMode) {
        form.reset({
            name: patient.name,
            gender: patient.gender,
            dob: patient.dob,
            email: patient.email,
            phone: patient.phone || '+'
        });
    }
     if (open && !isEditMode) {
        form.reset({
            name: '',
            gender: undefined,
            dob: '',
            email: '',
            phone: '+',
        });
    }
  }, [open, form, isEditMode, patient]);
  
  const dobValue = form.watch('dob');
  const calculatedAge = calculateAge(dobValue);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    
    const submissionData = {
        ...data,
        email: data.email || '',
        phone: data.phone || '',
    };
    
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
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., +14155552671" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                 <Button type="submit" disabled={isSubmitting}>
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

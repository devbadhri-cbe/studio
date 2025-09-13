
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useApp } from '@/context/app-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FormActions } from './form-actions';


interface EditDoctorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDoctorDetailsDialog({ open, onOpenChange }: EditDoctorDetailsDialogProps) {
  const { profile, setPatient } = useApp();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    defaultValues: {
      doctorName: '',
      doctorEmail: '',
      doctorPhone: '',
    },
  });

  React.useEffect(() => {
    if (open && profile) {
      form.reset({
        doctorName: profile.doctorName || '',
        doctorEmail: profile.doctorEmail || '',
        doctorPhone: profile.doctorPhone || '',
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (data: { doctorName?: string; doctorEmail?: string; doctorPhone?: string }) => {
    if (!profile) return;
    setIsSubmitting(true);
    try {
        setPatient({
            ...profile,
            doctorName: data.doctorName,
            doctorEmail: data.doctorEmail,
            doctorPhone: data.doctorPhone,
        });
        toast({
            title: 'Doctor Details Updated',
            description: "Your doctor's information has been saved.",
        });
        onOpenChange(false);
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: "Could not save your doctor's details.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Doctor's Details</DialogTitle>
          <DialogDescription>
            Enter or update the contact information for your consulting doctor.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="doctorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doctorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="doctor@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doctorPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormActions
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSubmitting}
              submitText="Save Details"
           />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

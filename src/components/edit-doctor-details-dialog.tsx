
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
import { updatePatient } from '@/lib/firestore';
import { doctorDetails } from '@/lib/doctor-data';


interface EditDoctorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditDoctorDetailsDialog({ open, onOpenChange }: EditDoctorDetailsDialogProps) {
  const { profile, setProfile } = useApp();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    defaultValues: {
      doctorName: '',
      doctorEmail: '',
      doctorPhone: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        doctorName: doctorDetails.name || '',
        doctorEmail: doctorDetails.email || '',
        doctorPhone: '',
      });
    }
  }, [open, form]);

  const onSubmit = async (data: { doctorName?: string; doctorEmail?: string; doctorPhone?: string }) => {
    setIsSubmitting(true);
    // This functionality is disabled in the single-doctor model.
    setTimeout(() => {
        toast({
            title: 'Action Disabled',
            description: "This feature is not available.",
        });
        setIsSubmitting(false);
        onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Doctor's Details</DialogTitle>
          <DialogDescription>
            Details of your consulting doctor.
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
                    <Input placeholder="Dr. John Doe" {...field} disabled />
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
                    <Input type="email" placeholder="doctor@example.com" {...field} disabled />
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
                    <Input type="tel" placeholder="+1 (555) 123-4567" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

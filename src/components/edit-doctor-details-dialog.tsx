
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
        doctorName: profile.doctorName || '',
        doctorEmail: profile.doctorEmail || '',
        doctorPhone: profile.doctorPhone || '',
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (data: { doctorName?: string; doctorEmail?: string; doctorPhone?: string }) => {
    setIsSubmitting(true);
    try {
      const updatedProfileData = {
        doctorName: data.doctorName,
        doctorEmail: data.doctorEmail,
        doctorPhone: data.doctorPhone,
      };
      
      const updatedPatient = await updatePatient(profile.id, updatedProfileData);
      setProfile(updatedPatient);

      toast({
        title: 'Success',
        description: "Doctor's details have been updated.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update doctor details', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update details. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Your Details</DialogTitle>
          <DialogDescription>
            Update your professional information that will be visible to your patients.
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/app-context';
import { doctorDetails } from '@/lib/doctor-data';

const DoctorDetailsSchema = z.object({
  doctorName: z.string().min(2, "Name is required."),
  doctorEmail: z.string().email("Please enter a valid email.").optional().or(z.literal('')),
  doctorPhone: z.string().min(10, "Please enter a valid phone number.").optional().or(z.literal('')),
});

interface EditDoctorDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditDoctorDetailsDialog({ open, onOpenChange }: EditDoctorDetailsDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const { profile, setProfile } = useApp();
  
  const form = useForm<z.infer<typeof DoctorDetailsSchema>>({
    resolver: zodResolver(DoctorDetailsSchema),
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
  }, [open, form, profile]);

  const onSubmit = async (data: z.infer<typeof DoctorDetailsSchema>) => {
    setIsSubmitting(true);
    try {
      setProfile({
        ...profile,
        doctorName: data.doctorName,
        doctorEmail: data.doctorEmail,
        doctorPhone: data.doctorPhone,
        doctorUid: doctorDetails.uid, // Assign the current doctor's UID
      });

      toast({
        title: 'Details Updated',
        description: "The doctor's contact information has been updated for this patient.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update details", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update details. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Doctor's Details</DialogTitle>
          <DialogDescription>
            Update the contact information for the doctor associated with this patient.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="doctorName" render={({ field }) => ( <FormItem><FormLabel>Doctor's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="doctorEmail" render={({ field }) => ( <FormItem><FormLabel>Doctor's Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="doctorPhone" render={({ field }) => ( <FormItem><FormLabel>Doctor's Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

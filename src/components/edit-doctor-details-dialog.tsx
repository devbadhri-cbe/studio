
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
import { doctorDetails } from '@/lib/doctor-data';

const DoctorDetailsSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  whatsapp: z.string().min(10, "Please enter a valid WhatsApp number."),
});

interface EditDoctorDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditDoctorDetailsDialog({ open, onOpenChange }: EditDoctorDetailsDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof DoctorDetailsSchema>>({
    resolver: zodResolver(DoctorDetailsSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
    },
  });

  React.useEffect(() => {
    if (open) {
        // In a real app, you would fetch this from a server/API.
        // For this demo, we'll use the hardcoded details.
        form.reset({
            name: doctorDetails.name,
            email: doctorDetails.email,
            phone: doctorDetails.phone,
            whatsapp: doctorDetails.whatsapp,
        });
    }
  }, [open, form]);

  const onSubmit = async (data: z.infer<typeof DoctorDetailsSchema>) => {
    setIsSubmitting(true);
    try {
      // In a real application, you would send this data to your backend to be saved.
      // For this prototype, we'll just show a success message.
      console.log('Updated Doctor Details:', data);
      
      // Here you would typically make an API call to update a doctor.json file or a database.
      // For now, we will just simulate a delay and close.
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Details Updated',
        description: "The doctor's contact information has been updated.",
      });
      // NOTE: The page will need to be refreshed to see the changes globally
      // as we are not updating the imported `doctorDetails` object in real-time.
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
            Update the contact information displayed throughout the application.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Doctor's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Public Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="whatsapp" render={({ field }) => ( <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
            
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

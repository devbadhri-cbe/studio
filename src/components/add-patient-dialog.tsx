
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Loader2 } from 'lucide-react';
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

const FormSchema = z.object({
  name: z.string().min(2, 'Patient name is required.'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required.' }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

export function AddPatientDialog() {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      dob: '',
      email: '',
      phone: '',
    },
  });
  
  const dobValue = form.watch('dob');
  const calculatedAge = calculateAge(dobValue);


  // NOTE: In a real application, this would call an API to create a new patient in the database.
  // Here, we'll just simulate the action.
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    console.log('New patient data:', data);
    setTimeout(() => {
        toast({
            title: 'Patient Added (Simulated)',
            description: `${data.name} has been added to the patient list.`,
        });
        setIsSubmitting(false);
        setOpen(false);
        form.reset();
        // Here you would typically trigger a refresh of the patient list.
    }, 1000);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1">
            <UserPlus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Patient</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>Enter the new patient's details to create their profile.</DialogDescription>
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
                      <Input type="tel" placeholder="e.g., +1234567890" {...field} />
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
                        Adding...
                        </>
                    ) : (
                        'Add Patient'
                    )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

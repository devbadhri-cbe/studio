
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { Separator } from './ui/separator';

const FormSchema = z.object({
  name: z.string(), // Keep name for structure, but will be disabled
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid date is required." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  country: z.string().min(1, { message: "Country is required." }),
  phone: z.string().min(5, { message: "Phone number is too short." }),
  height: z.coerce.number().min(50, 'Height must be at least 50cm.').optional().or(z.literal('')),
  weight: z.coerce.number().min(2, 'Weight must be at least 2kg.').optional().or(z.literal('')),
});

interface EditProfileDialogProps {
    children: React.ReactNode;
}

export function EditProfileDialog({ children }: EditProfileDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { profile, setProfile, addWeightRecord } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      dob: '',
      gender: undefined,
      email: '',
      country: '',
      phone: '',
      height: '',
      weight: '',
    },
  });
  
  const watchCountry = form.watch('country');

  React.useEffect(() => {
    if (watchCountry) {
        const countryData = countries.find(c => c.code === watchCountry);
        const currentPhone = form.getValues('phone');
        if (countryData && (!currentPhone || !countries.some(c => currentPhone.startsWith(c.phoneCode)))) {
             form.setValue('phone', countryData.phoneCode, { shouldValidate: true });
        }
    }
  }, [watchCountry, form]);
  
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    const updatedProfile: Partial<UserProfile> = {
        dob: data.dob,
        gender: data.gender,
        email: data.email,
        country: data.country,
        phone: data.phone,
        height: data.height || undefined,
    };
    try {
        setProfile({ ...profile, ...updatedProfile });
        if (data.weight) {
          addWeightRecord({ value: data.weight, date: new Date().toISOString() });
        }
        toast({
            title: 'Profile Updated',
            description: 'Your details have been successfully saved.',
        });
        setOpen(false);
    } catch (error) {
        console.error("Failed to update profile", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update your profile. Please try again.',
        });
    }
    setIsSubmitting(false);
  };
  
  React.useEffect(() => {
      if (open) {
          form.reset({
            name: profile?.name || '',
            dob: profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
            gender: profile?.gender || undefined,
            email: profile?.email || '',
            country: profile?.country || '',
            phone: profile?.phone || '',
            height: profile?.height || '',
            weight: '',
          });
      }
  }, [open, profile, form]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
          {children}
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg max-h-[90vh] flex flex-col p-0 sm:p-0">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal details below. Your name cannot be changed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
                <div className="p-4 sm:p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                           
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter patient's full name" {...field} disabled /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="dob" render={({ field }) => ( <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
                            
                            <Separator />
                            
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
                            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="patient@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl><FormMessage /></FormItem> )} />
                              <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Current Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </div>

                             <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

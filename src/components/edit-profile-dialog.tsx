

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { countries } from '@/lib/countries';
import { Loader2, Save } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { parseISO } from 'date-fns';
import { updatePatient } from '@/lib/firestore';
import { DatePicker } from './ui/date-picker';
import { cmToFtIn, ftInToCm } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { profile, setProfile } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const form = useForm({
    defaultValues: {
      name: '',
      gender: undefined as 'male' | 'female' | 'other' | undefined,
      email: '',
      country: '',
      phone: '',
      height: '',
      height_ft: '',
      height_in: '',
      dob: new Date(),
    },
  });

  const isImperial = profile.unitSystem === 'imperial';

  React.useEffect(() => {
    if (open) {
        let height_ft = '';
        let height_in = '';
        if(profile.height && isImperial) {
            const { feet, inches } = cmToFtIn(profile.height);
            height_ft = feet.toString();
            height_in = Math.round(inches).toString();
        }

        form.reset({
            name: profile?.name || '',
            dob: profile?.dob ? parseISO(profile.dob) : new Date(),
            gender: profile?.gender,
            email: profile?.email || '',
            country: profile?.country || '',
            phone: profile?.phone || '',
            height: !isImperial ? (profile?.height?.toString() || '') : '',
            height_ft: isImperial ? height_ft : '',
            height_in: isImperial ? height_in : '',
        });
    }
  }, [open, profile, form, isImperial]);

   const onProfileSubmit = async (data: any) => {
    setIsSubmitting(true);

    let heightInCm: number | undefined;
    if (isImperial) {
        const ft = data.height_ft ? Number(data.height_ft) : 0;
        const inches = data.height_in ? Number(data.height_in) : 0;
        heightInCm = ft > 0 || inches > 0 ? ftInToCm(ft, inches) : undefined;
    } else {
        heightInCm = data.height ? Number(data.height) : undefined;
    }

     const updatedProfileData = {
        name: data.name,
        dob: data.dob.toISOString(),
        gender: data.gender,
        email: data.email,
        country: data.country,
        phone: data.phone || '',
        height: heightInCm,
    };

    try {
        const updatedPatient = await updatePatient(profile.id, updatedProfileData);
        setProfile(updatedPatient);
        toast({
            title: 'Profile Updated',
            description: 'Your details have been successfully saved.',
        });
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to update profile", error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update profile. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const formContent = (
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
              
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter patient's full name" {...field} disabled /></FormControl><FormMessage /></FormItem> )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col border-2 border-blue-500 p-2">
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    fromYear={new Date().getFullYear() - 100}
                                    toYear={new Date().getFullYear()}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem className="border-2 border-green-500 p-2">
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="male" /></FormControl>
                                        <FormLabel className="font-normal">Male</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><RadioGroupItem value="female" /></FormControl>
                                        <FormLabel className="font-normal">Female</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              {isImperial ? (
                  <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="height_ft" render={({ field }) => ( <FormItem><FormLabel>Height (ft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name="height_in" render={({ field }) => ( <FormItem><FormLabel>Height (in)</FormLabel><FormControl><Input type="number" placeholder="e.g., 9" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
              ) : (
                  <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
              )}
              
              <Separator />
                <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="patient@example.com" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                  </Button>
              </div>
          </form>
      </Form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
           <SheetHeader className="p-6 border-b">
            <SheetTitle>Edit Profile</SheetTitle>
            <SheetDescription>
              Update your personal details below. Your name cannot be changed.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(90vh-80px)]">
            <div className="p-6">{formContent}</div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal details below. Your name cannot be changed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
                <div className="p-6">
                    {formContent}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

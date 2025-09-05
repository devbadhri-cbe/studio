

'use client';

import { UserCircle, Mail, Phone, VenetianMask, Globe, Cake, Edit, Save, X } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { parseISO } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { calculateAge, cmToFtIn, ftInToCm, formatDisplayPhoneNumber } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ProfileSettingsPopover } from './profile-settings-popover';
import { Loader2 } from 'lucide-react';
import { updatePatient } from '@/lib/firestore';
import { DatePicker } from './ui/date-picker';

const ProfileSchema = z.object({
  name: z.string().min(2, "Name is required."),
  dob: z.date({ required_error: "A valid date is required." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  country: z.string().min(1, { message: "Country is required." }),
  phone: z.string().min(5, { message: "Phone number is too short." }).optional().or(z.literal('')),
  height: z.coerce.number().min(50, 'Height must be at least 50cm.').optional().or(z.literal('')),
  height_ft: z.coerce.number().optional().or(z.literal('')),
  height_in: z.coerce.number().optional().or(z.literal('')),
});


export function ProfileCard() {
  const { profile, setProfile } = useApp();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formatDate = useDateFormatter();
  
  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      email: '',
      country: '',
      phone: '',
      height: '',
      height_ft: '',
      height_in: '',
    },
  });

  const isImperial = profile.unitSystem === 'imperial';

  React.useEffect(() => {
    if (isEditing) {
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
            height: !isImperial ? profile?.height || '' : '',
            height_ft: isImperial ? height_ft : '',
            height_in: isImperial ? height_in : '',
        });
    }
  }, [isEditing, profile, form, isImperial]);

  const onProfileSubmit = async (data: z.infer<typeof ProfileSchema>) => {
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
        setIsEditing(false);
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
  
  const calculatedAge = calculateAge(profile.dob);
  const country = countries.find(c => c.code === profile.country);
  const countryName = country?.name || profile.country;
  const formattedPhone = formatDisplayPhoneNumber(profile.phone, profile.country);


  return (
    <Card className="h-full shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircle className="h-10 w-10 shrink-0 text-muted-foreground" />
              <div>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your personal and medical information.</CardDescription>
              </div>
            </div>
             <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsEditing(p => !p)}>
                            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                            <span className="sr-only">{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isEditing ? 'Cancel' : 'Edit Profile'}</p>
                    </TooltipContent>
                </Tooltip>
                 <ProfileSettingsPopover />
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {isEditing ? (
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter patient's full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
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
                    <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
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

                     <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                     </Button>
                </form>
             </Form>
        ) : (
            <div className="space-y-3 rounded-lg border bg-card p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Cake className="h-5 w-5 shrink-0" />
                        <p>
                            {profile.dob ? formatDate(profile.dob) : 'N/A'}
                            {calculatedAge !== null && ` (${calculatedAge} yrs)`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <VenetianMask className="h-5 w-5 shrink-0" />
                        <p><span className="capitalize">{profile.gender || 'N/A'}</span></p>
                    </div>
                </div>

                <Separator className="my-2" />
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Globe className="h-5 w-5 shrink-0" />
                        <p>{countryName}</p>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Mail className="h-5 w-5 shrink-0" />
                        <p>{profile.email || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="h-5 w-5 shrink-0" />
                        <p>{formattedPhone}</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

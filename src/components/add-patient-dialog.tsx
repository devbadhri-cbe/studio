

'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Image from 'next/image';

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
import { countries } from '@/lib/countries';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


const FormSchema = z.object({
  name: z.string().min(2, 'Patient name is required.'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required.' }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required.'),
  phone: z.string().min(5, 'A valid phone number is required.'),
  height: z.coerce.number().min(50, 'Height must be at least 50cm.').optional(),
  weight: z.coerce.number().min(2, 'Weight must be at least 2kg.').optional(),
  photoUrl: z.string().url().optional(),
}).refine((data) => data.email || data.phone, {
    message: "Either email or phone number is required.",
    path: ["email"],
});


interface PatientFormDialogProps {
    patient?: Patient;
    onSave: (patient: Partial<Patient> & { weight?: number }, patientId?: string) => void;
    children: React.ReactNode | ((props: { openDialog: () => void }) => React.ReactNode);
}

export function PatientFormDialog({ patient, onSave, children }: PatientFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isEditMode = !!patient;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      dob: '',
      email: '',
      country: '',
      phone: '',
      height: '' as any,
      weight: '' as any,
      photoUrl: '',
    },
  });
  
  const selectedCountryCode = form.watch('country');
  const currentPhoneNumber = form.watch('phone');

  React.useEffect(() => {
    if (selectedCountryCode) {
        const country = countries.find(c => c.code === selectedCountryCode);
        if (country) {
            const countryCode = country.phoneCode;
            if (!currentPhoneNumber || !currentPhoneNumber.startsWith('+')) {
                 form.setValue('phone', countryCode, { shouldValidate: true });
            } else {
                const oldCodeMatch = currentPhoneNumber.match(/^\\+\\d+/);
                if (oldCodeMatch && oldCodeMatch[0] !== countryCode) {
                    const numberWithoutCode = currentPhoneNumber.substring(oldCodeMatch[0].length).trim();
                    form.setValue('phone', `${countryCode} ${numberWithoutCode}`, { shouldValidate: true });
                }
            }
        }
    }
  }, [selectedCountryCode, form, currentPhoneNumber]);
  
  React.useEffect(() => {
    if (open) {
        if (isEditMode && patient) {
             form.reset({
                name: patient.name,
                gender: patient.gender,
                dob: patient.dob,
                email: patient.email || '',
                country: patient.country,
                phone: patient.phone || '',
                height: patient.height || '' as any,
                weight: patient.weightRecords && patient.weightRecords.length > 0
                  ? [...patient.weightRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value
                  : '' as any,
                photoUrl: patient.photoUrl || '',
            });
            if (patient.photoUrl) {
                setPhotoPreview(patient.photoUrl);
            } else {
                setPhotoPreview(null);
            }
        } else {
            form.reset({
                name: '',
                gender: undefined,
                dob: '',
                email: '',
                country: '',
                phone: '',
                height: '' as any,
                weight: '' as any,
                photoUrl: '',
            });
            setPhotoPreview(null);
        }
    }
  }, [open, form, isEditMode, patient]);
  
  const dobValue = form.watch('dob');
  const calculatedAge = calculateAge(dobValue);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const fileRef = ref(storage, `profile_photos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        
        form.setValue('photoUrl', downloadUrl, { shouldValidate: true });
        setPhotoPreview(URL.createObjectURL(file));
        
        toast({
            title: 'Photo Uploaded',
            description: 'The profile picture has been uploaded successfully.',
        });
    } catch (error) {
        console.error("Photo upload failed:", error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not upload photo. Please try again.',
        });
    } finally {
        setIsUploading(false);
    }
  };


  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    
    const submissionData: Partial<Patient> & { weight?: number } = {
        ...data,
        email: data.email || '',
        phone: data.phone || '',
        height: data.height || undefined,
        weight: data.weight || undefined,
        photoUrl: data.photoUrl || undefined,
    };
    
    setTimeout(() => {
        onSave(submissionData, patient?.id);
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
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={photoPreview || undefined} alt="Patient photo" />
                    <AvatarFallback>
                        <User className="h-10 w-10 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <FormLabel>Profile Photo</FormLabel>
                    <Input id="photo-upload" type="file" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" />
                    <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {isUploading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                </div>
              </div>

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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 175" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.1" placeholder="e.g., 70" {...field} value={field.value ?? ''} />
                            </FormControl>
                             <FormDescription className='text-xs'>This will create a new weight record.</FormDescription>
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
               <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map(c => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Input type="tel" placeholder="Select a country first" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <DialogFooter>
                 <Button type="submit" disabled={isSubmitting || isUploading} size="sm">
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

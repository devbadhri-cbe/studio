
'use client';

import * as React from 'react';
import type { Patient, MedicalCondition, Medication } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { countries } from '@/lib/countries';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2, PlusCircle, Trash2, Upload, User, ShieldAlert } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Separator } from './ui/separator';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';
import { checkMedicationSpelling } from '@/ai/flows/medication-spell-check';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { DrugInteractionDialog } from './drug-interaction-dialog';


const FormSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid date is required." }),
  gender: z.enum(['male', 'female', 'other'], { required_error: "Gender is required." }),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  country: z.string().min(1, { message: "Country is required." }),
  phone: z.string().min(5, { message: "Phone number is too short." }),
  height: z.coerce.number().min(50, 'Height must be at least 50cm.').optional(),
  weight: z.coerce.number().min(2, 'Weight must be at least 2kg.').optional(),
  photoUrl: z.string().optional(),
  presentMedicalConditions: z.array(z.object({
    id: z.string().optional(),
    condition: z.string().min(2, "Condition is required."),
    date: z.string(),
    icdCode: z.string().optional(),
  })).optional(),
  medication: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Name is required."),
    dosage: z.string().min(1, "Dosage is required."),
    frequency: z.string().min(1, "Frequency is required."),
  })).optional(),
});


interface PatientFormDialogProps {
    patient?: Patient;
    onSave: (patient: Partial<Patient> & { weight?: number }, patientId?: string) => void;
    children: React.ReactNode | ((props: { openDialog: () => void }) => React.ReactNode);
}

const MedicationItemForm = ({ form, fieldName, index, remove, isChecking, setIsChecking, openPopover, setOpenPopover }: any) => {
    const [suggestion, setSuggestion] = React.useState<string | null>(null);

    const handleSpellCheck = async () => {
        const medName = form.getValues(`${fieldName}.${index}.name`);
        if (medName.length < 3) {
            setSuggestion(null);
            return;
        };

        setIsChecking(true);
        try {
            const result = await checkMedicationSpelling({ medicationName: medName });
            if (result.correctedName && result.correctedName.toLowerCase() !== medName.toLowerCase()) {
                setSuggestion(result.correctedName);
                setOpenPopover(index);
            } else {
                setSuggestion(null);
            }
        } catch (error) {
            console.error("Spell check failed", error);
            setSuggestion(null);
        } finally {
            setIsChecking(false);
        }
    }

    return (
        <div className="flex items-start gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                 <FormField
                    control={form.control}
                    name={`${fieldName}.${index}.name`}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Popover open={openPopover === index} onOpenChange={(isOpen) => !isOpen && setOpenPopover(null)}>
                                    <PopoverAnchor>
                                        <div className="relative">
                                            <Input placeholder="Medication Name" {...field} onBlur={handleSpellCheck} autoComplete="off" />
                                            {isChecking && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                                        </div>
                                    </PopoverAnchor>
                                    {suggestion && (
                                    <PopoverContent className="w-auto p-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span>Did you mean:</span>
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto font-semibold"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    form.setValue(`${fieldName}.${index}.name`, suggestion);
                                                    setOpenPopover(null);
                                                }}
                                            >
                                                {suggestion}
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                    )}
                                </Popover>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField control={form.control} name={`${fieldName}.${index}.dosage`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="Dosage (e.g., 500mg)" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name={`${fieldName}.${index}.frequency`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="Frequency (e.g., OD)" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0 h-9 w-9 mt-0.5">
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    );
};

const ConditionItemForm = ({ form, fieldName, index, remove, onSuggestIcd }: any) => {
    return (
        <div className="flex items-start gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                 <FormField control={form.control} name={`${fieldName}.${index}.condition`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="Condition Name" {...field} onBlur={() => onSuggestIcd(index)} /></FormControl><FormMessage /></FormItem> )} />
                 <FormField control={form.control} name={`${fieldName}.${index}.date`} render={({ field }) => ( <FormItem><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0 h-9 w-9 mt-0.5">
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    )
}

export function PatientFormDialog({ patient, onSave, children }: PatientFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [photoPreview, setPhotoPreview] = React.useState<string | undefined>(patient?.photoUrl);
  const [isCheckingMedication, setIsCheckingMedication] = React.useState(false);
  const [openMedicationPopover, setOpenMedicationPopover] = React.useState<number | null>(null);
  
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: patient?.name || '',
      dob: patient?.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
      gender: patient?.gender || undefined,
      email: patient?.email || '',
      country: patient?.country || '',
      phone: patient?.phone || '',
      height: patient?.height || undefined,
      weight: undefined, // Always ask for latest weight on edit
      photoUrl: patient?.photoUrl || '',
      medication: patient?.medication || [],
      presentMedicalConditions: patient?.presentMedicalConditions || [],
    },
  });

  const { fields: medFields, append: appendMed, remove: removeMed } = useFieldArray({
    control: form.control,
    name: 'medication',
  });
  
  const { fields: condFields, append: appendCond, remove: removeCond } = useFieldArray({
      control: form.control,
      name: 'presentMedicalConditions',
  });

  const watchCountry = form.watch('country');

  React.useEffect(() => {
    if (watchCountry) {
        const countryData = countries.find(c => c.code === watchCountry);
        const currentPhone = form.getValues('phone');
        if (countryData && (!currentPhone || !countries.some(c => currentPhone.startsWith(c.phoneCode)))) {
             form.setValue('phone', countryData.phoneCode, { shouldValidate: !!currentPhone && currentPhone.length >= 5 });
        }
    }
  }, [watchCountry, form]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
        const storage = getStorage();
        // Use a unique name for the file to prevent overwrites
        const fileRef = ref(storage, `profile_photos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        form.setValue('photoUrl', downloadUrl);
        toast({ title: 'Photo uploaded successfully!' });
    } catch (error) {
        console.error("Photo upload failed:", error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload photo.' });
        setPhotoPreview(patient?.photoUrl); // Revert on failure
    } finally {
        setIsUploading(false);
    }
  }

  const handleSuggestIcdCode = async (index: number) => {
    const conditionName = form.getValues(`presentMedicalConditions.${index}.condition`);
    if (!conditionName) return;

    try {
        const { icdCode, description } = await suggestIcdCode({ condition: conditionName });
        form.setValue(`presentMedicalConditions.${index}.icdCode`, `${icdCode}: ${description}`);
        toast({ title: 'ICD-10 Suggested', description: `${conditionName} -> ${icdCode}` });
    } catch (error) {
        console.error('Failed to get ICD code', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    await onSave({ ...data, id: patient?.id }, patient?.id);
    setIsSubmitting(false);
    setOpen(false);
  };
  
  React.useEffect(() => {
      if (!open) {
          form.reset({
              name: patient?.name || '',
              dob: patient?.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
              gender: patient?.gender || undefined,
              email: patient?.email || '',
              country: patient?.country || '',
              phone: patient?.phone || '',
              height: patient?.height || undefined,
              weight: undefined,
              photoUrl: patient?.photoUrl || '',
              medication: patient?.medication || [],
              presentMedicalConditions: patient?.presentMedicalConditions || [],
          });
          setPhotoPreview(patient?.photoUrl);
      }
  }, [open, patient, form]);


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
      <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>{patient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
          <DialogDescription>
            Fill out the form below to {patient ? 'update the patient\'s details' : 'add a new patient to your list'}.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4">
                <Form {...form}>
                <form id="patient-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <FormField
                            control={form.control}
                            name="photoUrl"
                            render={() => (
                                <FormItem>
                                    <FormControl>
                                        <button 
                                            type="button"
                                            onClick={() => document.getElementById('photo-upload-input')?.click()}
                                            disabled={isUploading}
                                            className="relative rounded-full group shrink-0"
                                        >
                                            <Avatar className="h-24 w-24">
                                                <AvatarImage src={photoPreview} />
                                                <AvatarFallback>
                                                    {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : 
                                                        <>
                                                            <User className="h-10 w-10 text-muted-foreground group-hover:hidden" />
                                                            <Upload className="h-10 w-10 text-muted-foreground hidden group-hover:block" />
                                                        </>
                                                    }
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </FormControl>
                                    <Input id="photo-upload-input" type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="w-full space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="dob" render={({ field }) => ( <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-2 pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem> )} />
                            </div>
                        </div>
                    </div>

                    <Separator />
                    <h3 className="text-lg font-medium">Contact &amp; Location</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
                    </div>
                    
                     <Separator />
                    <h3 className="text-lg font-medium">Physical Measurements</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl><FormDescription>Enter the latest weight. It will be added as a new record.</FormDescription><FormMessage /></FormItem> )} />
                    </div>
                    
                    <Separator />
                    
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium">Medication</h3>
                            <div className="flex items-center gap-2">
                                 <DrugInteractionDialog medications={form.watch('medication')?.map(m => `${m.name} ${m.dosage}`) || []} disabled={form.watch('medication')?.length < 2}>
                                     <Button type="button" size="sm" variant="outline" disabled={form.watch('medication')?.length < 2}><ShieldAlert className="mr-2 h-4 w-4" />Check Interactions</Button>
                                 </DrugInteractionDialog>
                                 <Button type="button" size="sm" variant="outline" onClick={() => appendMed({ name: '', dosage: '', frequency: '' })}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {medFields.map((field, index) => (
                                <MedicationItemForm key={field.id} form={form} fieldName="medication" index={index} remove={removeMed} isChecking={isCheckingMedication} setIsChecking={setIsCheckingMedication} openPopover={openMedicationPopover} setOpenPopover={setOpenMedicationPopover} />
                            ))}
                             {medFields.length === 0 && <p className="text-sm text-center text-muted-foreground py-2">No medications added.</p>}
                        </div>
                     </div>
                     
                     <Separator />

                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <h3 className="text-lg font-medium">Medical Conditions</h3>
                             <Button type="button" size="sm" variant="outline" onClick={() => appendCond({ condition: '', date: new Date().toISOString().split('T')[0] })}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
                        </div>
                        <div className="space-y-2">
                           {condFields.map((field, index) => (
                                <ConditionItemForm key={field.id} form={form} fieldName="presentMedicalConditions" index={index} remove={removeCond} onSuggestIcd={handleSuggestIcdCode} />
                           ))}
                           {condFields.length === 0 && <p className="text-sm text-center text-muted-foreground py-2">No medical conditions added.</p>}
                        </div>
                    </div>

                </form>
                </Form>
            </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t shrink-0">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="patient-form" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {patient ? 'Save Changes' : 'Add Patient'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
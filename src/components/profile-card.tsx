

'use client';

import { UserCircle, Mail, Phone, VenetianMask, Globe, Stethoscope, Pill, PlusCircle, Trash2, Loader2, ShieldAlert, TrendingUp, Ruler, Check, X, Pencil, Cake, Settings, Info, XCircle, Edit, Save } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, isValid, parseISO } from 'date-fns';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';
import { standardizeMedication } from '@/ai/flows/standardize-medication';
import { cn } from '@/lib/utils';
import { updatePatient } from '@/lib/firestore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { calculateAge, calculateBmi, cmToFtIn, ftInToCm, kgToLbs, lbsToKg, formatDisplayPhoneNumber } from '@/lib/utils';
import { countries, Country } from '@/lib/countries';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { DrugInteractionViewer } from './drug-interaction-viewer';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { DatePicker } from './ui/date-picker';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { MedicationSynopsisDialog } from './medication-synopsis-dialog';
import { ConditionSynopsisDialog } from './condition-synopsis-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { ProfileSettingsPopover } from './profile-settings-popover';


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
  weight: z.coerce.number().min(2, 'Weight must be at least 2kg.').optional().or(z.literal('')),
});

const MedicationSchema = z.object({
  medicationName: z.string().min(2, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
});

const ConditionSchema = z.object({
  condition: z.string().min(2, 'Condition name is required.'),
  date: z.date({ required_error: 'A valid date is required.' }),
});

function MedicalConditionForm({ onSave, onCancel }: { onSave: (data: {condition: string, date: Date}, icdCode?: string) => Promise<void>, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useApp();
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const form = useForm<z.infer<typeof ConditionSchema>>({
    resolver: zodResolver(ConditionSchema),
    defaultValues: { condition: '', date: new Date() },
  });
  
  const handleSubmit = async (data: z.infer<typeof ConditionSchema>) => {
    setIsSubmitting(true);
    try {
      const { icdCode, description } = await suggestIcdCode({ condition: data.condition });
      await onSave(data, `${icdCode}: ${description}`);
       toast({
        title: 'Condition Added',
        description: `Suggested ICD-11 code: ${icdCode}`,
      });
    } catch (error) {
       console.error('Failed to get ICD code suggestion', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not get ICD code suggestion. The condition will be added without it.',
      });
      await onSave(data);
    } finally {
      setIsSubmitting(false);
      onCancel();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2 space-y-4 rounded-lg border bg-muted/50 p-2">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  placeholder='Date of Diagnosis'
                  value={field.value}
                  onChange={field.onChange}
                  fromYear={new Date().getFullYear() - 50}
                  toYear={new Date().getFullYear()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormControl><Input ref={inputRef} placeholder="Condition Name" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" className="flex-1" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" size="sm" className="flex-1" disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

const WeightSchema = z.object({
    value: z.coerce.number().min(2, 'Weight must be at least 2kg.'),
    date: z.date({ required_error: 'A valid date is required.' }),
});

function WeightForm({ onSave, onCancel }: { onSave: (data: z.infer<typeof WeightSchema>) => void, onCancel: () => void }) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { profile } = useApp();
    const isImperial = profile.unitSystem === 'imperial';

    const form = useForm<z.infer<typeof WeightSchema>>({
        resolver: zodResolver(WeightSchema),
        defaultValues: { value: '' as any, date: new Date() },
    });
    
    React.useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100)
    }, []);

    const handleSave = (data: z.infer<typeof WeightSchema>) => {
        const dbValue = isImperial ? lbsToKg(data.value) : data.value;
        onSave({ ...data, value: parseFloat(dbValue.toFixed(2)) });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="mt-2 space-y-4 rounded-lg border bg-muted/50 p-2">
                <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormControl><DatePicker placeholder="Date of Weight" value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="value" render={({ field }) => (<FormItem><FormControl><Input ref={inputRef} type="number" step="0.01" placeholder={`Weight (${isImperial ? 'lbs' : 'kg'})`} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" size="sm" className="flex-1">Save</Button>
                </div>
            </form>
        </Form>
    );
}

type ActiveSynopsis = {
    type: 'medication' | 'condition';
    id: string;
} | null;

export function ProfileCard() {
  const { profile, setProfile, addMedicalCondition, removeMedicalCondition, addMedication, removeMedication, weightRecords, addWeightRecord, removeWeightRecord, setMedicationNil } = useApp();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [isAddingCondition, setIsAddingCondition] = React.useState(false);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);
  const [isAddingWeight, setIsAddingWeight] = React.useState(false);
  const [showInteraction, setShowInteraction] = React.useState(false);
  const [activeSynopsis, setActiveSynopsis] = React.useState<ActiveSynopsis>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [animateShield, setAnimateShield] = React.useState(false);

  const formatDate = useDateFormatter();
  const medicationNameInputRef = React.useRef<HTMLInputElement>(null);

  const medicationForm = useForm<z.infer<typeof MedicationSchema>>({
    resolver: zodResolver(MedicationSchema),
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
    },
  });

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
      weight: '',
    },
  });

  const isImperial = profile.unitSystem === 'imperial';
  
  const sortedWeights = React.useMemo(() => [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [weightRecords]);
  const latestWeight = sortedWeights[0];

  React.useEffect(() => {
    if (isEditing) {
        const countryData = countries.find(c => c.code === profile.country);
        
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
            weight: latestWeight?.value ? (isImperial ? parseFloat(kgToLbs(latestWeight.value).toFixed(2)) : parseFloat(latestWeight.value.toFixed(2))) : '',
        });
    }
  }, [isEditing, profile, latestWeight, form, isImperial]);

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
        weight: data.weight, // Pass weight separately to be handled by updatePatient
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
  
  const displayWeight = latestWeight?.value
    ? isImperial
      ? `${kgToLbs(latestWeight.value).toFixed(2)} lbs`
      : `${latestWeight.value.toFixed(2)} kg`
    : 'N/A';

  const displayHeight = profile.height
    ? isImperial
      ? `${cmToFtIn(profile.height).feet}' ${Math.round(cmToFtIn(profile.height).inches)}"`
      : `${Math.round(profile.height)} cm`
    : 'N/A';
    
  const formattedPhone = formatDisplayPhoneNumber(profile.phone, profile.country);


  const bmi = calculateBmi(latestWeight?.value, profile.height || 0);
  const isMedicationNil = profile.medication.length === 1 && profile.medication[0].name.toLowerCase() === 'nil';

  const handleSaveMedication = async (data: z.infer<typeof MedicationSchema>) => {
    setIsSubmitting(true);
    try {
        const standardized = await standardizeMedication(data);
        addMedication({
            name: standardized.name,
            dosage: standardized.dosage,
            frequency: standardized.frequency,
        });
        medicationForm.reset();
        setIsAddingMedication(false);
        if (profile.medication.length >= 1) { 
            setAnimateShield(true);
            setTimeout(() => setAnimateShield(false), 2000);
        }
        toast({
            title: 'Medication Added',
            description: `${standardized.name} has been added to your list.`,
        });
    } catch (error) {
        console.error("Failed to standardize or add medication", error);
        toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: 'Could not add the medication. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  React.useEffect(() => {
    if (isAddingMedication) {
        setTimeout(() => {
            medicationNameInputRef.current?.focus();
        }, 100);
    }
  }, [isAddingMedication]);

  const handleRemoveMedication = (id: string) => {
    removeMedication(id);
    if(activeSynopsis?.type === 'medication' && activeSynopsis.id === id) {
        setActiveSynopsis(null);
    }
  };
  
  const handleSetMedicationNil = () => {
      setMedicationNil();
  }

  const handleSaveWeight = (data: z.infer<typeof WeightSchema>) => {
      addWeightRecord({ ...data, value: data.value });
      setIsAddingWeight(false);
  }

  const handleSaveCondition = async (data: { condition: string, date: Date }, icdCode?: string) => {
    addMedicalCondition({ ...data, date: data.date.toISOString(), icdCode });
    setIsAddingCondition(false);
  };

  const handleSynopsisToggle = (type: 'medication' | 'condition', id: string) => {
    if (activeSynopsis?.id === id) {
      setActiveSynopsis(null);
    } else {
      setActiveSynopsis({ type, id });
    }
  };
  
  const handleRemoveCondition = (id: string) => {
      removeMedicalCondition(id);
      if (activeSynopsis?.type === 'condition' && activeSynopsis.id === id) {
          setActiveSynopsis(null);
      }
  }


  return (
    <Card className="h-full">
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
                        <FormItem>
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
                    <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Weight ({isImperial ? 'lbs' : 'kg'})</FormLabel><FormControl><Input type="number" step="0.01" placeholder={isImperial ? 'e.g., 154.32' : 'e.g., 70.00'} {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )} />
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
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <Ruler className="h-5 w-5 shrink-0" />
                         <p>{displayHeight}</p>
                    </div>
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <TrendingUp className="h-5 w-5 shrink-0" />
                         <p>
                            {displayWeight}
                            {bmi && <span className="ml-2 font-semibold text-foreground">(BMI: {bmi.toFixed(1)})</span>}
                        </p>
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

        <div>
            <div className="flex items-center justify-between mb-2">
                <div className='flex items-center gap-3 flex-1'>
                    <TrendingUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Weight Records</h3>
                </div>
                 <div className="flex items-center gap-1 shrink-0">
                    {!isAddingWeight && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setIsAddingWeight(true)}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Weight Record</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
            {isAddingWeight && <WeightForm onSave={handleSaveWeight} onCancel={() => setIsAddingWeight(false)} />}
            {sortedWeights.length > 0 ? (
                 <ul className="space-y-1 mt-2">
                    {sortedWeights.slice(0, 3).map((weight) => {
                        const displayRecordWeight = isImperial
                            ? `${kgToLbs(weight.value).toFixed(2)} lbs`
                            : `${weight.value.toFixed(2)} kg`;

                        return (
                            <li key={weight.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                               <div className="flex-1">
                                    <span className="font-semibold text-foreground">{displayRecordWeight}</span>
                                    <span className="block text-xs">on {formatDate(weight.date)}</span>
                               </div>
                               <div className="flex items-center shrink-0">
                                   <Tooltip>
                                    <TooltipTrigger asChild>
                                       <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeWeightRecord(weight.id)}>
                                           <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                       </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete record</TooltipContent>
                                   </Tooltip>
                                </div>
                            </li>
                        );
                    })}
                 </ul>
            ) : (
                !isAddingWeight && <p className="text-xs text-muted-foreground pl-8">No weight recorded.</p>
            )}
        </div>
        
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className='flex items-center gap-3 flex-1'>
                    <Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Present Medical Conditions</h3>
                </div>
                 <div className="flex items-center gap-1 shrink-0">
                    {!isAddingCondition && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setIsAddingCondition(true)}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Condition</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                 </div>
            </div>
             {isAddingCondition && <MedicalConditionForm onSave={handleSaveCondition} onCancel={() => setIsAddingCondition(false)} />}
            {profile.presentMedicalConditions.length > 0 ? (
                <ul className="space-y-1 mt-2">
                    {profile.presentMedicalConditions.map((condition) => (
                        <React.Fragment key={condition.id}>
                             <li className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md cursor-pointer" onClick={() => handleSynopsisToggle('condition', condition.id)}>
                               <div className="flex-1">
                                   <p className="font-semibold text-foreground">{condition.condition}</p>
                                   {condition.icdCode && <p className='text-xs text-muted-foreground'>ICD-11: {condition.icdCode}</p>}
                                   <p className="text-xs text-muted-foreground">Diagnosed: {formatDate(condition.date)}</p>
                               </div>
                                <div className="flex items-center shrink-0">
                                     <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleRemoveCondition(condition.id); }}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
                                        <Info className="h-4 w-4 text-blue-500" />
                                    </Button>
                                </div>
                            </li>
                            {activeSynopsis?.type === 'condition' && activeSynopsis.id === condition.id && (
                                <li className="pl-5 pb-2">
                                    <ConditionSynopsisDialog
                                        conditionName={condition.condition}
                                        onClose={() => setActiveSynopsis(null)}
                                    />
                                </li>
                            )}
                        </React.Fragment>
                    ))}
                </ul>
            ) : (
                !isAddingCondition && <p className="text-xs text-muted-foreground pl-8">No conditions recorded.</p>
            )}
        </div>

        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                    <Pill className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Current Medication</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {!isAddingMedication && (
                        <>
                            {profile.medication.length === 0 ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="sm" variant="outline" className="h-8" onClick={handleSetMedicationNil}>
                                            Set to Nil
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>If no medication is being taken.</TooltipContent>
                                </Tooltip>
                            ) : null}

                            {!isMedicationNil && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                setIsAddingMedication(true);
                                            }}
                                        >
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Add Medication</TooltipContent>
                                </Tooltip>
                            )}
                        </>
                    )}
                </div>
            </div>
            {isAddingMedication && (
                <Form {...medicationForm}>
                    <form onSubmit={medicationForm.handleSubmit(handleSaveMedication)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
                        <FormField control={medicationForm.control} name="medicationName" render={({ field }) => (<FormItem><FormControl><Input ref={medicationNameInputRef} placeholder="Medication Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-2 gap-2">
                            <FormField control={medicationForm.control} name="dosage" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Dosage (e.g., 500mg)" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={medicationForm.control} name="frequency" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Frequency (e.g., Daily)" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingMedication(false)}>Cancel</Button>
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
            {profile.medication.length > 0 ? (
                <ul className="space-y-1 mt-2">
                    {profile.medication.map((med) => (
                        <React.Fragment key={med.id}>
                            <li className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md cursor-pointer" onClick={() => med.name.toLowerCase() !== 'nil' && handleSynopsisToggle('medication', med.id)}>
                               <div className="flex-1">
                               {med.name.toLowerCase() === 'nil' ? (
                                       <span className="font-semibold text-foreground">Nil - No medication</span>
                               ) : (
                                   <>
                                       <span className="font-semibold text-foreground">{med.name}</span>
                                       <span className='block'>({med.dosage}, {med.frequency})</span>
                                   </>
                               )}
                               </div>
                                <div className="flex items-center shrink-0">
                                    {med.name.toLowerCase() !== 'nil' ? (
                                        <>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleRemoveMedication(med.id); }}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
                                                <Info className="h-4 w-4 text-blue-500" />
                                            </Button>
                                        </>
                                    ) : (
                                         <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleRemoveMedication(med.id); }}>
                                            <XCircle className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    )}
                                </div>
                            </li>
                             {activeSynopsis?.type === 'medication' && activeSynopsis.id === med.id && (
                                <li className="pl-5 pb-2">
                                    <MedicationSynopsisDialog
                                        medicationName={med.name}
                                        onClose={() => setActiveSynopsis(null)}
                                    />
                                </li>
                            )}
                        </React.Fragment>
                    ))}
                </ul>
            ) : (
                 !isAddingMedication && <p className="text-xs text-muted-foreground pl-8">No medication recorded.</p>
            )}
             {profile.medication.length > 1 && !isMedicationNil && (
                <div className="pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setShowInteraction(s => !s)}
                    >
                        <ShieldAlert className={cn('mr-2 h-4 w-4', animateShield && 'animate-spin')} />
                        {showInteraction ? 'Hide Interactions' : 'Check Drug Interactions'}
                    </Button>
                    {showInteraction && (
                        <DrugInteractionViewer
                            medications={profile.medication.map(m => `${m.name} ${m.dosage}`)}
                            onClose={() => setShowInteraction(false)}
                        />
                    )}
                </div>
            )}
        </div>

      </CardContent>
    </Card>
  );
}

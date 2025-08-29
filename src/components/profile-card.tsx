
'use client';

import { UserCircle, Mail, Phone, VenetianMask, Globe, Stethoscope, Pill, PlusCircle, Trash2, Loader2, ShieldAlert, TrendingUp, Ruler, Check, X, Pencil, Cake, Settings } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, isValid, parseISO } from 'date-fns';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { calculateAge, calculateBmi, cmToFtIn, ftInToCm, kgToLbs, lbsToKg, formatDisplayPhoneNumber } from '@/lib/utils';
import { countries, Country, dateFormats } from '@/lib/countries';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { DrugInteractionDialog } from './drug-interaction-dialog';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { DatePicker } from './ui/date-picker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { UnitSystem } from '@/lib/types';
import { Dialog, DialogTrigger } from './ui/dialog';


const MedicationSchema = z.object({
  medicationName: z.string().min(2, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
});

function MedicationForm({ onSave, onCancel }: { onSave: (data: { name: string; dosage: string; frequency: string; }) => void, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<{ originalData: z.infer<typeof MedicationSchema>, correctedName: string } | null>(null);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof MedicationSchema>>({
    resolver: zodResolver(MedicationSchema),
    defaultValues: { medicationName: '', dosage: '', frequency: '' },
  });

  const handleFinalSave = (data: z.infer<typeof MedicationSchema>) => {
    onSave({
      name: data.medicationName,
      dosage: data.dosage,
      frequency: data.frequency,
    });
    form.reset();
  };
  
  const handleInitialSubmit = async (data: z.infer<typeof MedicationSchema>) => {
    setIsSubmitting(true);
    setPopoverOpen(false);
    try {
        const response = await fetch(`https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(data.medicationName)}`);
        if (!response.ok) throw new Error('API request failed');
        const apiData = await response.json();
        const suggestions = apiData.suggestionGroup?.suggestionList?.suggestion;

        if (suggestions && suggestions.length > 0 && suggestions[0].toLowerCase() !== data.medicationName.toLowerCase()) {
            setSuggestion({ originalData: data, correctedName: suggestions[0] });
            setPopoverOpen(true);
        } else {
            handleFinalSave(data);
        }
    } catch (error) {
        console.error("Spell check failed, saving as is.", error);
        toast({
            variant: 'destructive',
            title: 'Spell Check Failed',
            description: 'Could not reach the spelling suggestion service. Saving medication as entered.'
        });
        handleFinalSave(data);
    } finally {
        setIsSubmitting(false);
    }
  };

  const onConfirmSuggestion = () => {
    if (suggestion) {
        handleFinalSave({ ...suggestion.originalData, medicationName: suggestion.correctedName });
    }
    setPopoverOpen(false);
    setSuggestion(null);
  };

  const onIgnoreSuggestion = () => {
    if (suggestion) {
        handleFinalSave(suggestion.originalData);
    }
    setPopoverOpen(false);
    setSuggestion(null);
  }

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
           <FormField
            control={form.control}
            name="medicationName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Medication Name"
                    {...field}
                    onChange={(e) => field.onChange(capitalizeFirstLetter(e.target.value))}
                    autoComplete="new-password"
                    spellCheck={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-2">
            <FormField control={form.control} name="dosage" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Dosage (e.g., 500mg)" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="frequency" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Frequency (e.g., Daily)" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                 <div className="space-y-2">
                    <p className="text-sm">
                      Did you mean <strong className="text-foreground">{suggestion?.correctedName}</strong>?
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={onIgnoreSuggestion}>Save as is</Button>
                        <Button size="sm" onClick={onConfirmSuggestion}>Use Suggestion</Button>
                    </div>
                 </div>
              </PopoverContent>
            </Popover>
          </div>
        </form>
      </Form>
  );
}


const ConditionSchema = z.object({
  condition: z.string().min(2, 'Condition name is required.'),
  date: z.date({ required_error: 'A valid date is required.' }),
});

function MedicalConditionForm({ onSave, onCancel }: { onSave: (data: {condition: string, date: Date}, icdCode?: string) => Promise<void>, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
        <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Condition Name" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
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
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
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
    const form = useForm<z.infer<typeof WeightSchema>>({
        resolver: zodResolver(WeightSchema),
        defaultValues: { value: '' as any, date: new Date() },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
                <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name="value" render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.1" placeholder="Weight (kg)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" size="sm">Save</Button>
                </div>
            </form>
        </Form>
    );
}

const HeightSchema = z.object({
    height_cm: z.coerce.number().optional(),
    height_ft: z.coerce.number().optional(),
    height_in: z.coerce.number().optional(),
}).refine(data => {
    if (data.height_cm) return data.height_cm >= 50 && data.height_cm <= 250;
    if (data.height_ft || data.height_in) return (data.height_ft || 0) > 0 || (data.height_in || 0) > 0;
    return false;
}, {
    message: "A valid height is required.",
    path: ["height_cm"], // show error on first field
});

function HeightForm({
    currentHeight,
    unitSystem,
    onSave,
    onCancel,
}: {
    currentHeight?: number;
    unitSystem: UnitSystem;
    onSave: (height: number) => void;
    onCancel: () => void;
}) {
    const defaultValues = React.useMemo(() => {
        if (unitSystem === 'imperial' && currentHeight) {
            const { feet, inches } = cmToFtIn(currentHeight);
            return { height_ft: feet, height_in: inches };
        }
        return { height_cm: currentHeight };
    }, [currentHeight, unitSystem]);

    const form = useForm<z.infer<typeof HeightSchema>>({
        resolver: zodResolver(HeightSchema),
        defaultValues,
    });
    
    const handleSubmit = (data: z.infer<typeof HeightSchema>) => {
        let heightInCm: number;
        if (unitSystem === 'imperial') {
            heightInCm = ftInToCm(data.height_ft || 0, data.height_in || 0);
        } else {
            heightInCm = data.height_cm || 0;
        }
        onSave(heightInCm);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-start gap-2 flex-1">
                {unitSystem === 'metric' ? (
                    <FormField control={form.control} name="height_cm" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input type="number" placeholder="cm" {...field} value={field.value ?? ''} className="h-8" /></FormControl><FormMessage className="text-xs" /></FormItem> )}/>
                ) : (
                    <div className="flex flex-1 gap-2">
                        <FormField control={form.control} name="height_ft" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input type="number" placeholder="ft" {...field} value={field.value ?? ''} className="h-8" /></FormControl><FormMessage className="text-xs" /></FormItem> )}/>
                        <FormField control={form.control} name="height_in" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input type="number" placeholder="in" {...field} value={field.value ?? ''} className="h-8" /></FormControl><FormMessage className="text-xs" /></FormItem> )}/>
                    </div>
                )}
                <Tooltip><TooltipTrigger asChild><Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-green-600"><Check className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Save</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onCancel}><X className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Cancel</TooltipContent></Tooltip>
            </form>
        </Form>
    );
}

const EmailSchema = z.object({ email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')) });
function EmailForm({ currentEmail, onSave, onCancel }: { currentEmail?: string; onSave: (email: string) => void; onCancel: () => void }) {
    const form = useForm<z.infer<typeof EmailSchema>>({ resolver: zodResolver(EmailSchema), defaultValues: { email: currentEmail || '' } });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => onSave(d.email || ''))} className="flex items-center gap-2 flex-1">
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input type="email" placeholder="patient@example.com" {...field} className="h-8" /></FormControl><FormMessage className="text-xs" /></FormItem> )}/>
                <Tooltip><TooltipTrigger asChild><Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-green-600"><Check className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Save</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onCancel}><X className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Cancel</TooltipContent></Tooltip>
            </form>
        </Form>
    );
}

const PhoneSchema = z.object({ phone: z.string().min(5, { message: "Phone number is too short." }) });
function PhoneForm({ currentPhone, onSave, onCancel }: { currentPhone?: string; onSave: (phone: string) => void; onCancel: () => void }) {
    const form = useForm<z.infer<typeof PhoneSchema>>({ resolver: zodResolver(PhoneSchema), defaultValues: { phone: currentPhone || '' } });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => onSave(d.phone))} className="flex items-center gap-2 flex-1">
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input type="tel" {...field} className="h-8" /></FormControl><FormMessage className="text-xs" /></FormItem> )}/>
                <Tooltip><TooltipTrigger asChild><Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-green-600"><Check className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Save</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onCancel}><X className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Cancel</TooltipContent></Tooltip>
            </form>
        </Form>
    );
}

const CountrySchema = z.object({ country: z.string().min(1, { message: "Country is required." }) });
function CountryForm({ currentCountry, onSave, onCancel }: { currentCountry?: string; onSave: (country: string) => void; onCancel: () => void }) {
    const form = useForm<z.infer<typeof CountrySchema>>({ resolver: zodResolver(CountrySchema), defaultValues: { country: currentCountry || '' } });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => onSave(d.country))} className="flex items-center gap-2 flex-1">
                <FormField control={form.control} name="country" render={({ field }) => ( <FormItem className="flex-1"><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-8"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage className="text-xs" /></FormItem> )}/>
                <Tooltip><TooltipTrigger asChild><Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-green-600"><Check className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Save</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onCancel}><X className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Cancel</TooltipContent></Tooltip>
            </form>
        </Form>
    );
}

const DobSchema = z.object({ dob: z.date({ required_error: "A valid date is required." }) });
function DobForm({ currentDob, onSave, onCancel }: { currentDob?: string; onSave: (dob: string) => void; onCancel: () => void }) {
    const form = useForm<z.infer<typeof DobSchema>>({ resolver: zodResolver(DobSchema), defaultValues: { dob: currentDob ? parseISO(currentDob) : undefined } });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => onSave(format(d.dob, 'yyyy-MM-dd')))} className="flex items-center gap-2 flex-1">
                <FormField 
                    control={form.control} 
                    name="dob" 
                    render={({ field }) => ( 
                        <FormItem className="flex-1">
                            <FormControl>
                                <DatePicker 
                                    value={field.value} 
                                    onChange={field.onChange} 
                                    fromYear={new Date().getFullYear() - 100}
                                    toYear={new Date().getFullYear()}
                                />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem> 
                    )}
                />
                <Tooltip><TooltipTrigger asChild><Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-green-600"><Check className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Save</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onCancel}><X className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Cancel</TooltipContent></Tooltip>
            </form>
        </Form>
    );
}


export function ProfileCard() {
  const { profile, setProfile, addMedicalCondition, removeMedicalCondition, addMedication, removeMedication, weightRecords, addWeightRecord, removeWeightRecord, setMedicationNil } = useApp();
  const [isAddingCondition, setIsAddingCondition] = React.useState(false);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);
  const [isAddingWeight, setIsAddingWeight] = React.useState(false);
  const [isEditingHeight, setIsEditingHeight] = React.useState(false);
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [isEditingPhone, setIsEditingPhone] = React.useState(false);
  const [isEditingCountry, setIsEditingCountry] = React.useState(false);
  const [isEditingDob, setIsEditingDob] = React.useState(false);
  const [medicationChanged, setMedicationChanged] = React.useState(false);
  const [isDrugInteractionOpen, setIsDrugInteractionOpen] = React.useState(false);
  const formatDate = useDateFormatter();

  const calculatedAge = calculateAge(profile.dob);
  const country = countries.find(c => c.code === profile.country);
  const countryName = country?.name || profile.country;
  const sortedWeights = React.useMemo(() => [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [weightRecords]);
  const latestWeight = sortedWeights[0];

  const { unitSystem } = profile;
  
  const displayWeight = latestWeight?.value
    ? unitSystem === 'imperial'
      ? `${kgToLbs(latestWeight.value).toFixed(2)} lbs`
      : `${latestWeight.value.toFixed(2)} kg`
    : 'N/A';

  const displayHeight = profile.height
    ? unitSystem === 'imperial'
      ? `${cmToFtIn(profile.height).feet}' ${cmToFtIn(profile.height).inches.toFixed(2)}"`
      : `${profile.height.toFixed(2)} cm`
    : 'N/A';
    
  const formattedPhone = formatDisplayPhoneNumber(profile.phone, profile.country);


  const bmi = calculateBmi(latestWeight?.value, profile.height || 0);
  const isMedicationNil = profile.medication.length === 1 && profile.medication[0].name.toLowerCase() === 'nil';


  const handleSaveCondition = async (data: { condition: string, date: Date }, icdCode?: string) => {
    addMedicalCondition({ ...data, date: data.date.toISOString(), icdCode });
    setIsAddingCondition(false);
  };
  
  const handleSaveMedication = (data: { name: string; dosage: string; frequency: string; }) => {
    addMedication(data);
    setIsAddingMedication(false);
    setMedicationChanged(true);
  }

  const handleRemoveMedication = (id: string) => {
    removeMedication(id);
    setMedicationChanged(true);
  }
  
  const handleSetMedicationNil = () => {
      setMedicationNil();
      setMedicationChanged(true);
  }

  const handleSaveWeight = (data: z.infer<typeof WeightSchema>) => {
      addWeightRecord({ ...data, date: data.date.toISOString() });
      setIsAddingWeight(false);
  }

  const handleSaveHeight = (newHeight: number) => {
    setProfile({ ...profile, height: newHeight });
    setIsEditingHeight(false);
  };

  const handleSaveEmail = (newEmail: string) => {
    setProfile({ ...profile, email: newEmail });
    setIsEditingEmail(false);
  };

  const handleSavePhone = (newPhone: string) => {
    setProfile({ ...profile, phone: newPhone });
    setIsEditingPhone(false);
  };

  const handleSaveCountry = (newCountry: string) => {
    const newCountryData = countries.find(c => c.code === newCountry);
    setProfile({ ...profile, country: newCountry, dateFormat: newCountryData?.dateFormat || 'MM-dd-yyyy', unitSystem: newCountryData?.unitSystem || 'metric' });
    setIsEditingCountry(false);
  };
  
  const handleSaveDateFormat = (newFormat: string) => {
    setProfile({ ...profile, dateFormat: newFormat });
  }

  const handleSaveUnitSystem = (newSystem: UnitSystem) => {
    setProfile({ ...profile, unitSystem: newSystem });
  }

  const handleSaveDob = (newDob: string) => {
    setProfile({ ...profile, dob: newDob });
    setIsEditingDob(false);
  };


  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <UserCircle className="h-10 w-10 shrink-0 text-muted-foreground" />
              <div>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Your personal and medical information.</CardDescription>
              </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3 text-muted-foreground">
                <Cake className="h-5 w-5 shrink-0" />
                {isEditingDob ? (
                    <DobForm currentDob={profile.dob} onSave={handleSaveDob} onCancel={() => setIsEditingDob(false)} />
                ) : (
                   <div className="flex items-center gap-2 flex-1">
                        <p>
                            {profile.dob ? formatDate(profile.dob) : 'N/A'}
                            {calculatedAge !== null && ` (${calculatedAge} years)`}
                        </p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditingDob(true)}>
                                    <Pencil className="h-3 w-3 text-border" strokeWidth={1.5} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Date of Birth</p>
                            </TooltipContent>
                        </Tooltip>
                        
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6">
                                            <Settings className="h-3 w-3 text-border" strokeWidth={1.5} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Change Date Format ({profile.dateFormat})</p>
                                </TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent className="font-sans">
                                {dateFormats.map(f => (
                                    <DropdownMenuItem 
                                        key={f.format} 
                                        onSelect={() => handleSaveDateFormat(f.format)}
                                        className={profile.dateFormat === f.format ? 'bg-accent' : ''}
                                    >
                                        {f.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
             <div className="flex items-center gap-3 text-muted-foreground">
                <VenetianMask className="h-5 w-5 shrink-0" />
                <p>
                    <span className="capitalize">{profile.gender || 'N/A'}</span>
                </p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Ruler className="h-5 w-5 shrink-0" />
                 {isEditingHeight ? (
                    <HeightForm unitSystem={unitSystem} currentHeight={profile.height} onSave={handleSaveHeight} onCancel={()={() => setIsEditingHeight(false)} />
                ) : (
                    <div className="flex items-center gap-2 flex-1">
                        <p>{displayHeight}</p>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditingHeight(true)}>
                                    <Pencil className="h-3 w-3 text-border" strokeWidth={1.5} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Height</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <TrendingUp className="h-5 w-5 shrink-0" />
                 <p>
                    {displayWeight}
                    {bmi && <span className="ml-2 font-semibold text-foreground">(BMI: {bmi.toFixed(2)})</span>}
                </p>
                 <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-6 w-6">
                                    <Settings className="h-3 w-3 text-border" strokeWidth={1.5} />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Change Units ({profile.unitSystem})</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent className="font-sans">
                        <DropdownMenuItem 
                            onSelect={() => handleSaveUnitSystem('metric')}
                            className={profile.unitSystem === 'metric' ? 'bg-accent' : ''}
                        >
                            Metric (kg, cm)
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onSelect={() => handleSaveUnitSystem('imperial')}
                            className={profile.unitSystem === 'imperial' ? 'bg-accent' : ''}
                        >
                            Imperial (lbs, ft, in)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Separator className="my-2" />
             <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="h-5 w-5 shrink-0" />
                {isEditingCountry ? (
                    <CountryForm currentCountry={profile.country} onSave={handleSaveCountry} onCancel={() => setIsEditingCountry(false)} />
                ) : (
                    <div className="flex items-center gap-2 flex-1">
                        <p>{countryName}</p>
                        <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditingCountry(true)}><Pencil className="h-3 w-3 text-border" strokeWidth={1.5} /></Button></TooltipTrigger><TooltipContent><p>Edit Country</p></TooltipContent></Tooltip>
                    </div>
                )}
            </div>
             <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 shrink-0" />
                {isEditingEmail ? (
                    <EmailForm currentEmail={profile.email} onSave={handleSaveEmail} onCancel={() => setIsEditingEmail(false)} />
                ) : (
                    <div className="flex items-center gap-2 flex-1">
                        <p>{profile.email || 'N/A'}</p>
                        <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditingEmail(true)}><Pencil className="h-3 w-3 text-border" strokeWidth={1.5} /></Button></TooltipTrigger><TooltipContent><p>Edit Email</p></TooltipContent></Tooltip>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 shrink-0" />
                 {isEditingPhone ? (
                    <PhoneForm currentPhone={profile.phone} onSave={handleSavePhone} onCancel={() => setIsEditingPhone(false)} />
                ) : (
                    <div className="flex items-center gap-2 flex-1">
                        <p>{formattedPhone}</p>
                        <Tooltip><TooltipTrigger asChild><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditingPhone(true)}><Pencil className="h-3 w-3 text-border" strokeWidth={1.5} /></Button></TooltipTrigger><TooltipContent><p>Edit Phone</p></TooltipContent></Tooltip>
                    </div>
                )}
            </div>
        </div>

        <div>
             <div className="flex items-center justify-between gap-3 mb-2">
                <div className='flex items-center gap-3'>
                    <TrendingUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Weight Records</h3>
                </div>
                 {!isAddingWeight && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setIsAddingWeight(true)}>
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add Weight Record</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
            {isAddingWeight && <WeightForm onSave={handleSaveWeight} onCancel={() => setIsAddingWeight(false)} />}
            {sortedWeights.length > 0 ? (
                 <ul className="space-y-1 mt-2">
                    {sortedWeights.slice(0, 3).map((weight) => {
                        const displayRecordWeight = unitSystem === 'imperial'
                            ? `${kgToLbs(weight.value).toFixed(2)} lbs`
                            : `${weight.value.toFixed(2)} kg`;

                        return (
                            <li key={weight.id} className="group flex items-start gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                               <div className="flex-1">
                                    <span className="font-semibold text-foreground">{displayRecordWeight}</span>
                                    <span className="block text-xs">on {formatDate(weight.date)}</span>
                               </div>
                               <Tooltip>
                                <TooltipTrigger asChild>
                                   <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeWeightRecord(weight.id)}>
                                       <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                   </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete record</TooltipContent>
                               </Tooltip>
                            </li>
                        );
                    })}
                 </ul>
            ) : (
                !isAddingWeight && <p className="text-xs text-muted-foreground pl-8">No weight recorded.</p>
            )}
        </div>
        
        <div>
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className='flex items-center gap-3'>
                    <Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Present Medical Conditions</h3>
                </div>
                 {!isAddingCondition && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setIsAddingCondition(true)}>
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add Condition</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
             {isAddingCondition && <MedicalConditionForm onSave={handleSaveCondition} onCancel={() => setIsAddingCondition(false)} />}
            {profile.presentMedicalConditions.length > 0 ? (
                <ul className="space-y-1 mt-2">
                    {profile.presentMedicalConditions.map((condition) => (
                        <li key={condition.id} className="group flex items-start gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">{condition.condition}</p>
                                {condition.icdCode && <p className='text-xs text-muted-foreground'>ICD-11: {condition.icdCode}</p>}
                                <p className="text-xs text-muted-foreground">Diagnosed: {formatDate(condition.date)}</p>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={()={() => removeMedicalCondition(condition.id)}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete condition</TooltipContent>
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            ) : (
                !isAddingCondition && <p className="text-xs text-muted-foreground pl-8">No conditions recorded.</p>
            )}
        </div>

        <div>
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Current Medication</h3>
                </div>
                <div className="flex items-center gap-1">
                    {profile.medication.length > 1 && !isMedicationNil && (
                        <Dialog open={isDrugInteractionOpen} onOpenChange={setIsDrugInteractionOpen}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button 
                                            size="icon" 
                                            variant="outline" 
                                            className={`h-7 w-7 ${medicationChanged ? 'animate-pulse-once bg-blue-500/20' : ''}`}
                                            onClick={() => setMedicationChanged(false)}
                                        >
                                            <ShieldAlert className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Check Drug Interactions</p>
                                </TooltipContent>
                            </Tooltip>
                            <DrugInteractionDialog
                                open={isDrugInteractionOpen}
                                medications={profile.medication.map(m => `${m.name} ${m.dosage}`)}
                            />
                        </Dialog>
                    )}
                     {profile.medication.length === 0 && !isAddingMedication && (
                        <Tooltip>
                           <TooltipTrigger asChild>
                               <Button size="icon" variant="outline" className="h-7 w-7" onClick={handleSetMedicationNil}>
                                   Nil
                               </Button>
                           </TooltipTrigger>
                           <TooltipContent>Set medication to Nil</TooltipContent>
                        </Tooltip>
                    )}
                     {!isAddingMedication && !isMedicationNil && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setIsAddingMedication(true)}>
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Medication</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
             {isAddingMedication && <MedicationForm onSave={handleSaveMedication} onCancel={()={() => setIsAddingMedication(false)} />}
            {profile.medication.length > 0 ? (
                <ul className="space-y-1 mt-2">
                    {profile.medication.map((med) => (
                         <li key={med.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                             {med.name.toLowerCase() === 'nil' ? (
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="font-semibold text-foreground">Nil - No medication</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => handleRemoveMedication(med.id)}>
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete entry</TooltipContent>
                                    </Tooltip>
                                </div>
                             ) : (
                                <>
                                    <div className='flex-1'>
                                        <span className="font-semibold text-foreground">{med.name}</span>
                                        <span className='block'>({med.dosage}, {med.frequency})</span>
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveMedication(med.id)}>
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete medication</TooltipContent>
                                    </Tooltip>
                                </>
                             )}
                        </li>
                    ))}
                </ul>
            ) : (
                 !isAddingMedication && <p className="text-xs text-muted-foreground pl-8">No medication recorded.</p>
            )}
        </div>

      </CardContent>
    </Card>
  );
}

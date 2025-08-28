
'use client';

import { UserCircle, Mail, Phone, VenetianMask, Globe, Stethoscope, Pill, PlusCircle, Trash2, Loader2, ShieldAlert, TrendingUp, Ruler, Edit } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { calculateAge, calculateBmi } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';
import { DrugInteractionDialog } from './drug-interaction-dialog';
import { Separator } from './ui/separator';
import { checkMedicationSpelling } from '@/ai/flows/medication-spell-check';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from './ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { EditProfileDialog } from './edit-profile-dialog';


const MedicationSchema = z.object({
  medicationName: z.string().min(2, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
});

function MedicationForm({ onSave, onCancel, isCheckingSpelling, setIsCheckingSpelling }: { onSave: (data: { name: string; dosage: string; frequency: string; }) => void, onCancel: () => void, isCheckingSpelling: boolean, setIsCheckingSpelling: (isChecking: boolean) => void }) {
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = React.useState(false);
  const [ignoredSuggestions, setIgnoredSuggestions] = React.useState<string[]>([]);


  const form = useForm<z.infer<typeof MedicationSchema>>({
    resolver: zodResolver(MedicationSchema),
    defaultValues: { medicationName: '', dosage: '', frequency: '' },
  });
  
  const handleUpdateMedicationName = (name: string) => {
    form.setValue('medicationName', name);
    setIsSuggestionOpen(false);
  }

  const handleSpellCheck = async () => {
    const medicationName = form.getValues('medicationName');
    if (medicationName.length < 3 || ignoredSuggestions.includes(medicationName.toLowerCase())) {
        setSuggestion(null);
        setIsSuggestionOpen(false);
        return;
    };

    setIsCheckingSpelling(true);
    try {
      const result = await checkMedicationSpelling({ medicationName });
      if (result.correctedName && result.correctedName.toLowerCase() !== medicationName.toLowerCase()) {
        setSuggestion(result.correctedName);
        setIsSuggestionOpen(true);
      } else {
        setSuggestion(null);
        setIsSuggestionOpen(false);
      }
    } catch (error) {
      console.error("Medication spell check failed", error);
      setSuggestion(null);
      setIsSuggestionOpen(false);
    } finally {
      setIsCheckingSpelling(false);
    }
  }

  const handleSave = (data: z.infer<typeof MedicationSchema>) => {
    onSave({
      name: data.medicationName,
      dosage: data.dosage,
      frequency: data.frequency,
    });
    form.reset();
    setIgnoredSuggestions([]);
  };

  const handlePopoverOpenChange = (open: boolean) => {
    if (!open) {
        const medicationName = form.getValues('medicationName');
        if (medicationName && !ignoredSuggestions.includes(medicationName.toLowerCase())) {
            setIgnoredSuggestions([...ignoredSuggestions, medicationName.toLowerCase()]);
        }
    }
    setIsSuggestionOpen(open);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
        <div className="grid grid-cols-3 gap-2">
           <FormField 
            control={form.control} 
            name="medicationName" 
            render={({ field }) => ( 
                <FormItem>
                    <FormControl>
                        <Popover open={isSuggestionOpen} onOpenChange={handlePopoverOpenChange}>
                            <PopoverAnchor asChild>
                                <div className="relative">
                                    <Input 
                                        placeholder="Name" 
                                        {...field}
                                        onBlur={handleSpellCheck}
                                        autoComplete="off"
                                    />
                                </div>
                            </PopoverAnchor>
                            <PopoverContent className="w-auto p-2" onOpenAutoFocus={(e) => e.preventDefault()}>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">Did you mean:</span>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleUpdateMedicationName(suggestion!)}
                                        className="p-0 h-auto font-semibold"
                                    >
                                        {suggestion}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </FormControl>
                    <FormMessage />
                </FormItem> 
            )} 
          />
          <FormField control={form.control} name="dosage" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Dosage" {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="frequency" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Frequency" {...field} /></FormControl><FormMessage /></FormItem> )} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => { onCancel(); setIgnoredSuggestions([]); }}>Cancel</Button>
          <Button type="submit" size="sm">Save</Button>
        </div>
      </form>
    </Form>
  );
}


const ConditionSchema = z.object({
  condition: z.string().min(2, 'Condition name is required.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
});

function MedicalConditionForm({ onSave, onCancel }: { onSave: (data: z.infer<typeof ConditionSchema>, icdCode?: string) => Promise<void>, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ConditionSchema>>({
    resolver: zodResolver(ConditionSchema),
    defaultValues: { condition: '', date: format(new Date(), 'yyyy-MM-dd') },
  });
  
  const handleSubmit = async (data: z.infer<typeof ConditionSchema>) => {
    setIsSubmitting(true);
    try {
      const { icdCode, description } = await suggestIcdCode({ condition: data.condition });
      await onSave(data, `${icdCode}: ${description}`);
       toast({
        title: 'Condition Added',
        description: `Suggested ICD-10 code: ${icdCode}`,
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
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
        <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Condition Name" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        <FormField control={form.control} name="date" render={({ field }) => ( <FormItem><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )}/>
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
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'A valid date is required.' }),
});

function WeightForm({ onSave, onCancel }: { onSave: (data: z.infer<typeof WeightSchema>) => void, onCancel: () => void }) {
    const form = useForm<z.infer<typeof WeightSchema>>({
        resolver: zodResolver(WeightSchema),
        defaultValues: { value: '' as any, date: format(new Date(), 'yyyy-MM-dd') },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
                <div className="grid grid-cols-2 gap-2">
                    <FormField control={form.control} name="value" render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.1" placeholder="Weight (kg)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" size="sm">Save</Button>
                </div>
            </form>
        </Form>
    );
}

export function ProfileCard() {
  const { profile, addMedicalCondition, removeMedicalCondition, addMedication, removeMedication, weightRecords, addWeightRecord, removeWeightRecord, setMedicationNil } = useApp();
  const [isAddingCondition, setIsAddingCondition] = React.useState(false);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);
  const [isAddingWeight, setIsAddingWeight] = React.useState(false);
  const [isCheckingSpelling, setIsCheckingSpelling] = React.useState(false);
  const [medicationChanged, setMedicationChanged] = React.useState(false);

  const calculatedAge = calculateAge(profile.dob);
  const countryName = countries.find(c => c.code === profile.country)?.name || profile.country;
  const sortedWeights = React.useMemo(() => [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [weightRecords]);
  const latestWeight = sortedWeights[0];
  const bmi = calculateBmi(latestWeight?.value, profile.height || 0);
  const isMedicationNil = profile.medication.length === 1 && profile.medication[0].name.toLowerCase() === 'nil';


  const handleSaveCondition = async (data: z.infer<typeof ConditionSchema>, icdCode?: string) => {
    addMedicalCondition({ ...data, date: new Date(data.date).toISOString(), icdCode });
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
      addWeightRecord(data);
      setIsAddingWeight(false);
  }

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
            <EditProfileDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Profile</p>
                </TooltipContent>
              </Tooltip>
            </EditProfileDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3 text-muted-foreground">
                <VenetianMask className="h-5 w-5 shrink-0" />
                <p>
                    {calculatedAge !== null ? `${calculatedAge} years` : 'N/A'}, <span className="capitalize">{profile.gender || 'N/A'}</span>
                </p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Ruler className="h-5 w-5 shrink-0" />
                <p>{profile.height ? `${profile.height} cm` : 'N/A'}</p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <TrendingUp className="h-5 w-5 shrink-0" />
                 <p>
                    {latestWeight ? `${latestWeight.value} kg` : 'N/A'}
                    {bmi && <span className="ml-2 font-semibold text-foreground">(BMI: {bmi})</span>}
                </p>
            </div>

             <Separator className="my-2" />

             <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 shrink-0" />
                <p>{profile.email || 'N/A'}</p>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 shrink-0" />
                <p>{profile.phone || 'N/A'}</p>
            </div>
             <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="h-5 w-5 shrink-0" />
                <p>{countryName}</p>
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
                    {sortedWeights.slice(0, 3).map((weight) => (
                        <li key={weight.id} className="group flex items-start gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                           <div className="flex-1">
                                <span className="font-semibold text-foreground">{weight.value} kg</span>
                                <span className="block text-xs">on {format(new Date(weight.date), 'dd-MMM-yyyy')}</span>
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
                    ))}
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
                                <span className="font-semibold text-foreground">{condition.condition}</span>
                                {condition.icdCode && <span className='block text-xs'>ICD-10: {condition.icdCode}</span>}
                                <span className="block text-xs">Diagnosed: {format(new Date(condition.date), 'dd-MMM-yyyy')}</span>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeMedicalCondition(condition.id)}>
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
                    <DrugInteractionDialog
                        medications={profile.medication.map(m => `${m.name} ${m.dosage}`)}
                        disabled={isCheckingSpelling || profile.medication.length < 2 || isMedicationNil}
                        onOpenChange={(open) => {
                            if (open) {
                                setMedicationChanged(false);
                            }
                        }}
                    >
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    size="icon" 
                                    variant="outline" 
                                    className={`h-7 w-7 ${medicationChanged ? 'animate-pulse-once bg-blue-500/20' : ''}`}
                                    disabled={isCheckingSpelling || profile.medication.length < 2 || isMedicationNil}
                                >
                                    <ShieldAlert className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Check Drug Interactions</p>
                            </TooltipContent>
                        </Tooltip>
                    </DrugInteractionDialog>
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
             {isAddingMedication && <MedicationForm onSave={handleSaveMedication} onCancel={() => setIsAddingMedication(false)} isCheckingSpelling={isCheckingSpelling} setIsCheckingSpelling={setIsCheckingSpelling} />}
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

    
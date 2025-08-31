
'use client';

import { Stethoscope, Pill, PlusCircle, Trash2, Loader2, ShieldAlert, TrendingUp, Info, XCircle } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';
import { standardizeMedication } from '@/ai/flows/standardize-medication';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { kgToLbs } from '@/lib/utils';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { DrugInteractionViewer } from './drug-interaction-viewer';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { DatePicker } from './ui/date-picker';
import { MedicationSynopsisDialog } from './medication-synopsis-dialog';
import { ConditionSynopsisDialog } from './condition-synopsis-dialog';

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

export function MedicalHistoryCard() {
  const { profile, addMedicalCondition, removeMedicalCondition, addMedication, removeMedication, weightRecords, addWeightRecord, removeWeightRecord, setMedicationNil } = useApp();
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

  const isImperial = profile.unitSystem === 'imperial';
  
  const sortedWeights = React.useMemo(() => [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [weightRecords]);
  
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
    } catch (error) {
        console.error("Failed to standardize or add medication", error);
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
    <Card>
        <CardContent className="space-y-4 text-sm p-4">
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



'use client';

import { Stethoscope, PlusCircle, Loader2, Pill, ShieldAlert, Info, XCircle, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { DrugInteractionViewer } from './drug-interaction-viewer';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MedicationSynopsisDialog } from './medication-synopsis-dialog';
import { DatePicker } from './ui/date-picker';
import { DiseaseCard } from './disease-card';
import { Separator } from './ui/separator';

const ConditionSchema = z.object({
  condition: z.string().min(2, 'Condition name is required.'),
  date: z.date({ required_error: 'A valid date is required.' }),
});

const MedicationSchema = z.object({
  medicationName: z.string().min(2, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
});

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function MedicalConditionForm({ onSave, onCancel }: { onSave: (data: z.infer<typeof ConditionSchema>) => Promise<void>, onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
    await onSave({
        ...data,
        condition: capitalizeFirstLetter(data.condition),
    });
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-2 space-y-4 rounded-lg border bg-muted/50 p-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Diagnosis</FormLabel>
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
        <FormField control={form.control} name="condition" render={({ field }) => ( <FormItem><FormLabel>Condition Name</FormLabel><FormControl><Input ref={inputRef} placeholder="e.g., Type 2 Diabetes" {...field} /></FormControl><FormMessage /></FormItem> )}/>
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

type ActiveSynopsis = {
    type: 'medication' | 'condition';
    id: string;
} | null;

export function MedicalHistoryCard() {
  const { profile, addMedicalCondition, removeMedicalCondition, addMedication, removeMedication, setMedicationNil } = useApp();
  const [isAddingCondition, setIsAddingCondition] = React.useState(false);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);
  const [showInteraction, setShowInteraction] = React.useState(false);
  const [activeSynopsis, setActiveSynopsis] = React.useState<ActiveSynopsis>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const medicationNameInputRef = React.useRef<HTMLInputElement>(null);

  const medicationForm = useForm<z.infer<typeof MedicationSchema>>({
    resolver: zodResolver(MedicationSchema),
    defaultValues: { medicationName: '', dosage: '', frequency: '' },
  });

  const isMedicationNil = profile.medication.length === 1 && profile.medication[0].name.toLowerCase() === 'nil';

  const handleSaveCondition = async (data: z.infer<typeof ConditionSchema>) => {
    await addMedicalCondition({
      condition: data.condition,
      date: data.date.toISOString(),
    });
    setIsAddingCondition(false);
  };
  
  const handleReviseCondition = (id: string) => {
      removeMedicalCondition(id);
      setIsAddingCondition(true);
  }

  const handleSaveMedication = async (data: z.infer<typeof MedicationSchema>) => {
    setIsSubmitting(true);
    // AI standardization is removed. Direct entry.
    const standardized = {
        name: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
        brandName: data.medicationName,
    };
    addMedication({
        name: standardized.name,
        brandName: standardized.brandName,
        dosage: standardized.dosage,
        frequency: standardized.frequency,
    });
    medicationForm.reset();
    setIsAddingMedication(false);
    setIsSubmitting(false);
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

  const handleSynopsisToggle = (type: 'medication', id: string) => {
    if (activeSynopsis?.id === id) {
      setActiveSynopsis(null);
    } else {
      setActiveSynopsis({ type, id });
    }
  };
  
  return (
    <Card className="shadow-xl">
        <CardContent className="space-y-4 text-sm p-4">
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
                        {profile.presentMedicalConditions.map((condition) => {
                            if (!condition || !condition.id) return null;
                            return (
                                <DiseaseCard 
                                    key={condition.id}
                                    condition={condition}
                                    onRevise={handleReviseCondition}
                                />
                            )
                        })}
                    </ul>
                ) : (
                    !isAddingCondition && <p className="text-xs text-muted-foreground pl-8">No conditions recorded.</p>
                )}
            </div>

            <Separator />

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
                                    <div>
                                        {med.brandName && med.brandName.toLowerCase() !== med.name.toLowerCase() && (
                                            <p className="font-semibold text-foreground">{med.brandName}</p>
                                        )}
                                        <p className={cn("text-foreground", med.brandName && "text-muted-foreground text-xs")}>
                                            <span className="font-semibold">{med.name}</span>
                                            <span className="text-muted-foreground text-xs ml-2">({med.dosage}, {med.frequency})</span>
                                        </p>
                                    </div>
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
                         <DrugInteractionViewer
                            medications={profile.medication.map(m => `${m.name} ${m.dosage}`)}
                            onClose={() => setShowInteraction(false)}
                        />
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}

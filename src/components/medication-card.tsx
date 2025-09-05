

'use client';

import { Pill, PlusCircle, Trash2, Loader2, ShieldAlert, Info, XCircle } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { standardizeMedication } from '@/ai/flows/standardize-medication';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { DrugInteractionViewer } from './drug-interaction-viewer';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MedicationSynopsisDialog } from './medication-synopsis-dialog';

const MedicationSchema = z.object({
  medicationName: z.string().min(2, 'Medication name is required.'),
  dosage: z.string().min(1, 'Dosage is required.'),
  frequency: z.string().min(1, 'Frequency is required.'),
});

type ActiveSynopsis = {
    type: 'medication';
    id: string;
} | null;

export function MedicationCard() {
  const { profile, addMedication, removeMedication, setMedicationNil } = useApp();
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);
  const [showInteraction, setShowInteraction] = React.useState(false);
  const [activeSynopsis, setActiveSynopsis] = React.useState<ActiveSynopsis>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [animateShield, setAnimateShield] = React.useState(false);

  const medicationNameInputRef = React.useRef<HTMLInputElement>(null);

  const medicationForm = useForm<z.infer<typeof MedicationSchema>>({
    resolver: zodResolver(MedicationSchema),
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
    },
  });

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

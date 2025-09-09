

'use client';

import { Stethoscope, PlusCircle, Loader2, Pill, Info, Trash2, Edit, X, Settings } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import type { MedicalCondition, Medication } from '@/lib/types';
import { parseISO } from 'date-fns';
import { processMedicalCondition } from '@/ai/flows/process-medical-condition-flow';
import type { MedicalConditionOutput } from '@/lib/ai-types';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

function capitalizeFirstLetter(string: string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
}

interface MedicalConditionFormProps {
    onSave: (data: { condition: string; date: Date }) => Promise<void>;
    onCancel: () => void;
    initialData?: MedicalCondition;
    isProcessing: boolean;
}

function MedicalConditionForm({ 
    onSave, 
    onCancel,
    initialData,
    isProcessing,
}: MedicalConditionFormProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const form = useForm<{ condition: string; date: Date }>({
    defaultValues: { 
        condition: initialData?.userInput || initialData?.condition || '', 
        date: initialData?.date ? parseISO(initialData.date) : new Date() 
    },
  });
  
  const handleFormSubmit = async (data: { condition: string; date: Date }) => {
    await onSave({
        ...data,
        condition: capitalizeFirstLetter(data.condition),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="mt-2 space-y-4 rounded-lg border bg-muted/50 p-4">
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
        <FormField
            control={form.control}
            name="condition"
            rules={{ required: "Condition name is required." }}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Condition Name</FormLabel>
                    <FormControl>
                        <Input ref={inputRef} placeholder="e.g., Type 2 Diabetes" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={isProcessing}>Cancel</Button>
          <Button type="submit" size="sm" disabled={isProcessing}>
             {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
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

interface MedicalInfoSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actions: React.ReactNode;
}

function MedicalInfoSection({ title, icon, actions, children }: MedicalInfoSectionProps) {
  return (
    <div>
        <div className="flex items-center justify-between mb-2">
            <div className='flex items-center gap-3 flex-1'>
                {icon}
                <h3 className="font-medium">{title}</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                {actions}
            </div>
        </div>
        {children}
    </div>
  )
}

export function MedicalHistoryCard() {
  const { profile, addMedicalCondition, updateMedicalCondition, removeMedicalCondition, addMedication, removeMedication, setMedicationNil } = useApp();
  const [editingCondition, setEditingCondition] = React.useState<MedicalCondition | null>(null);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);
  const [showInteraction, setShowInteraction] = React.useState(false);
  const [activeSynopsis, setActiveSynopsis] = React.useState<ActiveSynopsis>(null);
  const [isSubmittingMedication, setIsSubmittingMedication] = React.useState(false);
  const [isProcessingCondition, setIsProcessingCondition] = React.useState(false);
  const [isEditingConditions, setIsEditingConditions] = React.useState(false);
  const [isEditingMedications, setIsEditingMedications] = React.useState(false);

  const medicationNameInputRef = React.useRef<HTMLInputElement>(null);

  const medicationForm = useForm<{medicationName: string, dosage: string, frequency: string}>({
    defaultValues: { medicationName: '', dosage: '', frequency: '' },
  });

  const isMedicationNil = profile.medication.length === 1 && profile.medication[0].name.toLowerCase() === 'nil';

  const handleProcessCondition = async (data: { condition: string; date: Date }) => {
    setIsProcessingCondition(true);

    const isUpdate = !!editingCondition?.id;
    const tempId = editingCondition?.id || `cond-${Date.now()}`;

    // Immediately add/update the condition in the UI with a loading state
    const optimisticCondition: MedicalCondition = {
      id: tempId,
      condition: data.condition,
      userInput: data.condition,
      date: data.date.toISOString(),
      icdCode: 'loading...',
      status: 'pending_review',
    };
    
    if (isUpdate) {
        updateMedicalCondition(optimisticCondition);
    } else {
        addMedicalCondition(optimisticCondition);
    }
    setEditingCondition(null);
    setIsProcessingCondition(false);

    try {
      const conditionsForCheck = isUpdate
          ? profile.presentMedicalConditions.filter(c => c.id !== tempId)
          : profile.presentMedicalConditions;

      const result = await processMedicalCondition({ 
        condition: data.condition,
        existingConditions: conditionsForCheck.map(c => ({ condition: c.condition, icdCode: c.icdCode || '' }))
      });
      
      if(result.isValid && result.standardizedName && result.icdCode) {
          const finalCondition: MedicalCondition = {
            ...optimisticCondition,
            condition: result.standardizedName,
            icdCode: result.icdCode,
            synopsis: result.synopsis,
            status: 'verified',
          };
          updateMedicalCondition(finalCondition);
          toast({ title: 'Condition Verified', description: `${result.standardizedName} has been processed.` });
      } else {
        // If not valid, remove the optimistic entry and show toast
        removeMedicalCondition(tempId);
        toast({ variant: 'destructive', title: 'Condition Invalid', description: `"${data.condition}" is not a recognized condition or already exists.` });
      }
    } catch (e) {
      console.error(e);
      // If AI fails, update the optimistic entry to show an error state
      const failedCondition: MedicalCondition = {
        ...optimisticCondition,
        icdCode: 'error',
        synopsis: 'Failed to process condition.',
      };
      updateMedicalCondition(failedCondition);
      toast({ variant: 'destructive', title: 'Error', description: "Could not process the medical condition." });
    }
  }


  const handleReviseCondition = (conditionToEdit: MedicalCondition) => {
      setEditingCondition(conditionToEdit);
  }

  const handleSaveMedication = async (data: {medicationName: string, dosage: string, frequency: string}) => {
    setIsSubmittingMedication(true);
    addMedication({
        name: data.medicationName,
        brandName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
    });
    medicationForm.reset();
    medicationNameInputRef.current?.focus();
    setIsSubmittingMedication(false);
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

  const handleSynopsisToggle = (type: 'medication' | 'condition', id: string) => {
    if (activeSynopsis?.type === type && activeSynopsis?.id === id) {
      setActiveSynopsis(null);
    } else {
      setActiveSynopsis({ type, id });
    }
  };
  
  const formatMedicationDetails = (med: Medication) => {
    const details = [med.dosage, med.frequency].filter(Boolean).join(', ');
    return details ? `(${details})` : '';
  }
  
  const handleCancelCondition = () => {
    setEditingCondition(null);
    setIsProcessingCondition(false);
  }
  
  const conditionActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setEditingCondition({} as MedicalCondition)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Condition
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setIsEditingConditions(!isEditingConditions)}
          disabled={profile.presentMedicalConditions.length === 0}
        >
          <Edit className="mr-2 h-4 w-4" />
          {isEditingConditions ? 'Done Editing' : 'Edit List'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const medicationActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isMedicationNil && (
          <DropdownMenuItem onSelect={() => setIsAddingMedication(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Medication
          </DropdownMenuItem>
        )}
        {!isMedicationNil && (
          <DropdownMenuItem
            onSelect={() => setIsEditingMedications(!isEditingMedications)}
            disabled={profile.medication.length === 0}
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditingMedications ? 'Done Editing' : 'Edit List'}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSetMedicationNil}>
            <X className="mr-2 h-4 w-4" />
            Set to Nil
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );


  return (
    <>
    <Card className="shadow-xl">
        <CardContent className="space-y-4 text-sm p-4">
            <MedicalInfoSection
              title="Present Medical Conditions"
              icon={<Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />}
              actions={!editingCondition && conditionActions}
            >
              {editingCondition && (
                    <MedicalConditionForm 
                        onSave={handleProcessCondition} 
                        onCancel={handleCancelCondition} 
                        initialData={editingCondition.id ? editingCondition : undefined}
                        isProcessing={isProcessingCondition}
                    />
                )}
                {profile.presentMedicalConditions.length > 0 ? (
                    <ul className="space-y-1 mt-2">
                        {profile.presentMedicalConditions.map((condition) => {
                            if (!condition || !condition.id) return null;
                            return (
                                <DiseaseCard 
                                    key={condition.id}
                                    condition={condition}
                                    onRevise={handleReviseCondition}
                                    onSynopsisToggle={() => handleSynopsisToggle('condition', condition.id)}
                                    isActive={activeSynopsis?.type === 'condition' && activeSynopsis?.id === condition.id}
                                    isEditMode={isEditingConditions}
                                />
                            )
                        })}
                    </ul>
                ) : (
                    !editingCondition && <p className="text-xs text-muted-foreground pl-8 pt-2">No conditions recorded.</p>
                )}
            </MedicalInfoSection>
            

            <Separator />

            <MedicalInfoSection
              title="Current Medication"
              icon={<Pill className="h-5 w-5 shrink-0 text-muted-foreground" />}
              actions={!isAddingMedication && medicationActions}
            >
              {isAddingMedication && (
                    <Form {...medicationForm}>
                        <form onSubmit={medicationForm.handleSubmit(handleSaveMedication)} className="mt-2 space-y-2 rounded-lg border bg-muted/50 p-2">
                            <FormField control={medicationForm.control} name="medicationName" render={({ field }) => (<FormItem><FormControl><Input ref={medicationNameInputRef} placeholder="Medication Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-2 gap-2">
                                <FormField control={medicationForm.control} name="dosage" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Dosage (e.g., 500mg)" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={medicationForm.control} name="frequency" render={({ field }) => ( <FormItem><FormControl><Input placeholder="Frequency (e.g., Daily)" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingMedication(false)}>Close</Button>
                                <Button type="submit" size="sm" disabled={isSubmittingMedication}>
                                    {isSubmittingMedication ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
                {profile.medication.length > 0 ? (
                    <ul className="space-y-1 mt-2">
                        {profile.medication.map((med) => (
                            <React.Fragment key={med.id}>
                                <li className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                                <div className="flex-1 cursor-pointer" onClick={() => med.name.toLowerCase() !== 'nil' && handleSynopsisToggle('medication', med.id)}>
                                {med.name.toLowerCase() === 'nil' ? (
                                        <span className="font-semibold text-foreground">Nil - No medication</span>
                                ) : (
                                    <div>
                                        {med.brandName && med.brandName.toLowerCase() !== med.name.toLowerCase() && (
                                            <p className="font-semibold text-foreground">{med.brandName}</p>
                                        )}
                                        <p className={cn("text-foreground", med.brandName && "text-muted-foreground text-xs")}>
                                            <span className="font-semibold">{med.name}</span>
                                            <span className="text-muted-foreground text-xs ml-2">{formatMedicationDetails(med)}</span>
                                        </p>
                                    </div>
                                )}
                                </div>
                                    <div className="flex items-center shrink-0">
                                        {isEditingMedications && med.name.toLowerCase() !== 'nil' && (
                                           <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleRemoveMedication(med.id); }}>
                                                <Trash2 className="h-5 w-5 text-destructive" />
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
                    !isAddingMedication && !editingCondition && <p className="text-xs text-muted-foreground pl-8 pt-2">No medication recorded.</p>
                )}
                {profile.medication.length > 1 && !isMedicationNil && (
                    <div className="pt-2">
                         <DrugInteractionViewer
                            medications={profile.medication.map(m => `${m.name} ${m.dosage}`)}
                            onClose={() => setShowInteraction(false)}
                        />
                    </div>
                )}
            </MedicalInfoSection>
        </CardContent>
    </Card>
    </>
  );
}



    
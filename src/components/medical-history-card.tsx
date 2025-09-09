

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
import { toast } from '@/hooks/use-toast';
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

interface MedicalConditionFormValues {
  condition: string;
  date: Date;
  icdCode?: string;
  synopsis?: string;
}

interface MedicalConditionFormProps {
    onSave: (data: MedicalCondition) => void;
    onCancel: () => void;
    initialData?: MedicalCondition;
}

function MedicalConditionForm({ 
    onSave, 
    onCancel,
    initialData,
}: MedicalConditionFormProps) {
  const { profile } = useApp();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [hasBeenProcessed, setHasBeenProcessed] = React.useState(!!initialData?.icdCode);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const form = useForm<MedicalConditionFormValues>({
    defaultValues: { 
        condition: initialData?.userInput || initialData?.condition || '', 
        date: initialData?.date ? parseISO(initialData.date) : new Date(),
        icdCode: initialData?.icdCode || '',
        synopsis: initialData?.synopsis || '',
    },
  });
  
  const handleProcessCondition = async () => {
    const userInput = form.getValues('condition');
    if (!userInput) {
        form.setError('condition', { type: 'manual', message: 'Condition name is required.' });
        return false;
    }
    setIsProcessing(true);
    try {
      const result = await processMedicalCondition({ condition: userInput });
      if (result.isValid && result.standardizedName && result.icdCode) {
        form.setValue('condition', result.standardizedName);
        form.setValue('icdCode', result.icdCode);
        form.setValue('synopsis', result.synopsis || '');
        toast({ title: 'Condition Processed', description: `AI suggested: ${result.standardizedName} (${result.icdCode})` });
        setHasBeenProcessed(true);
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Condition Not Recognized', description: `Suggestions: ${result.suggestions?.join(', ') || 'None'}` });
        setHasBeenProcessed(false);
        return false;
      }
    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process condition.' });
      setHasBeenProcessed(false);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }

  const handleFormSubmit = async (data: MedicalConditionFormValues) => {
    if (!hasBeenProcessed) {
        const success = await handleProcessCondition();
        if (!success) return; // Stop if processing fails
        
        // After successful processing, we need to get the updated data for the final save
        const updatedData = form.getValues();
        const isDuplicate = profile.presentMedicalConditions.some(c => c.id !== initialData?.id && c.icdCode === updatedData.icdCode);

        if (isDuplicate) {
            toast({ variant: 'destructive', title: 'Duplicate Condition', description: `A condition with ICD-11 code ${updatedData.icdCode} already exists.` });
            return;
        }
    } else {
         if (!data.icdCode) {
            form.setError('icdCode', { type: 'manual', message: 'Please process the condition to get an ICD code before saving.' });
            return;
        }
        
        const isDuplicate = profile.presentMedicalConditions.some(c => c.id !== initialData?.id && c.icdCode === data.icdCode);
        if (isDuplicate) {
            toast({ variant: 'destructive', title: 'Duplicate Condition', description: `A condition with ICD-11 code ${data.icdCode} already exists.` });
            return;
        }
        
        onSave({
          id: initialData?.id || `cond-${Date.now()}`,
          condition: data.condition,
          userInput: initialData?.userInput || form.getValues('condition'),
          date: data.date.toISOString(),
          icdCode: data.icdCode,
          synopsis: data.synopsis,
          status: 'pending_review',
        });
        onCancel();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="mt-2 space-y-4 rounded-lg border bg-muted/50 p-4">
        <FormField
            control={form.control}
            name="condition"
            rules={{ required: "Condition name is required." }}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Condition Name</FormLabel>
                    <FormControl>
                        <Input {...field} ref={inputRef} placeholder="e.g., Type 2 Diabetes" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
         <FormField
          control={form.control}
          name="icdCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ICD-11 Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="AI will suggest a code" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       
        <div className="flex justify-between items-end gap-4">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex-1">
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
            <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {hasBeenProcessed ? 'Confirm & Save' : 'Process & Review'}
                </Button>
            </div>
        </div>
      </form>
    </Form>
  );
}

interface MedicalInfoSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actions: React.ReactNode;
}

function MedicalInfoSection({ title, icon, actions, children }: MedicalInfoSectionProps) {
  return (
    <Card className="shadow-xl h-full flex flex-col">
        <CardContent className="space-y-4 text-sm p-4 flex-1 flex flex-col">
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
        </CardContent>
    </Card>
  )
}

function MedicationListItem({ med, isEditing, onRemove, formatDetails }: MedicationListItemProps) {
    const [isSynopsisOpen, setIsSynopsisOpen] = React.useState(false);

    return (
        <React.Fragment>
            <li className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
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
                        <span className="text-muted-foreground text-xs ml-2">{formatDetails(med)}</span>
                    </p>
                </div>
            )}
            </div>
                <div className="flex items-center shrink-0">
                    {med.name.toLowerCase() !== 'nil' && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 shrink-0"
                                    onClick={(e) => { e.stopPropagation(); setIsSynopsisOpen(prev => !prev); }}
                                >
                                    <Info className="h-5 w-5 text-blue-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Synopsis</TooltipContent>
                        </Tooltip>
                    )}
                    {isEditing && med.name.toLowerCase() !== 'nil' && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onRemove(med.id); }}>
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Medication</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </li>
            {isSynopsisOpen && (
                <li className="pl-5 pb-2">
                    <MedicationSynopsisDialog
                        medicationName={med.name}
                        onClose={() => setIsSynopsisOpen(false)}
                    />
                </li>
            )}
        </React.Fragment>
    )
}

interface MedicationListItemProps {
    med: Medication;
    isEditing: boolean;
    onRemove: (id: string) => void;
    formatDetails: (med: Medication) => string;
}

export function MedicalHistoryCard() {
  const { profile, addMedicalCondition, updateMedicalCondition, addMedication, removeMedication, setMedicationNil, removeMedicalCondition: removeMedicalConditionFromContext } = useApp();
  const [editingCondition, setEditingCondition] = React.useState<MedicalCondition | null>(null);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);
  const [showInteraction, setShowInteraction] = React.useState(false);
  const [isSubmittingMedication, setIsSubmittingMedication] = React.useState(false);
  const [isEditingConditions, setIsEditingConditions] = React.useState(false);
  const [isEditingMedications, setIsEditingMedications] = React.useState(false);

  const medicationNameInputRef = React.useRef<HTMLInputElement>(null);

  const medicationForm = useForm<{medicationName: string, dosage: string, frequency: string}>({
    defaultValues: { medicationName: '', dosage: '', frequency: '' },
  });

  const isMedicationNil = profile.medication.length === 1 && profile.medication[0].name.toLowerCase() === 'nil';

  const handleSaveCondition = (condition: MedicalCondition) => {
    const isUpdate = !!editingCondition?.id;
    if (isUpdate) {
        updateMedicalCondition(condition);
    } else {
        const optimisticId = `cond-${Date.now()}`;
        const newCondition = { ...condition, id: optimisticId, status: 'pending_review' as const };
        addMedicalCondition(newCondition);
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
  };
  
  const handleSetMedicationNil = () => {
      setMedicationNil();
  }
  
  const formatMedicationDetails = (med: Medication) => {
    const details = [med.dosage, med.frequency].filter(Boolean).join(', ');
    return details ? `(${details})` : '';
  }
  
  const handleCancelCondition = () => {
    setEditingCondition(null);
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
        <MedicalInfoSection
            title="Present Medical Conditions"
            icon={<Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />}
            actions={!editingCondition && conditionActions}
        >
            {editingCondition && (
                <MedicalConditionForm 
                    onSave={handleSaveCondition} 
                    onCancel={handleCancelCondition} 
                    initialData={editingCondition.id ? editingCondition : undefined}
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
                                isEditMode={isEditingConditions}
                                onRemove={() => removeMedicalConditionFromContext(condition.id)}
                            />
                        )
                    })}
                </ul>
            ) : (
                !editingCondition && <p className="text-xs text-muted-foreground pl-8 pt-2">No conditions recorded.</p>
            )}
        </MedicalInfoSection>
        

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
                       <MedicationListItem
                            key={med.id}
                            med={med}
                            isEditing={isEditingMedications}
                            onRemove={handleRemoveMedication}
                            formatDetails={formatMedicationDetails}
                        />
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
    </>
  );
}

    

    

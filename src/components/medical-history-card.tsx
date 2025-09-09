

'use client';

import { Stethoscope, PlusCircle, Loader2, Pill, Info, Trash2, Edit, X, Settings, ShieldAlert } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AddMedicationDialog } from './add-medication-dialog';

function capitalizeFirstLetter(string: string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
}

interface MedicalConditionFormValues {
  userInput: string;
  date: Date;
}

interface ProcessedCondition {
    standardizedName: string;
    icdCode: string;
    synopsis: string;
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
  const [processedCondition, setProcessedCondition] = React.useState<ProcessedCondition | null>(
    initialData?.icdCode ? { standardizedName: initialData.condition, icdCode: initialData.icdCode, synopsis: initialData.synopsis || '' } : null
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const form = useForm<MedicalConditionFormValues>({
    defaultValues: { 
        userInput: initialData?.userInput || initialData?.condition || '', 
        date: initialData?.date ? parseISO(initialData.date) : new Date(),
    },
  });
  
  const handleProcessCondition = async () => {
    const userInput = form.getValues('userInput');
    if (!userInput) {
        form.setError('userInput', { type: 'manual', message: 'Condition name is required.' });
        return;
    }
    setIsProcessing(true);
    setProcessedCondition(null);
    try {
      const result = await processMedicalCondition({ condition: userInput });
      if (result.isValid && result.standardizedName && result.icdCode) {
        setProcessedCondition({
            standardizedName: result.standardizedName,
            icdCode: result.icdCode,
            synopsis: result.synopsis || '',
        });
        toast({ title: 'Condition Processed', description: `AI suggested: ${result.standardizedName} (${result.icdCode})` });
      } else {
        toast({ variant: 'destructive', title: 'Condition Not Recognized', description: `Suggestions: ${result.suggestions?.join(', ') || 'None'}` });
      }
    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process condition.' });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleFormSubmit = async (data: MedicalConditionFormValues) => {
    if (!processedCondition) {
        await handleProcessCondition();
        return;
    }

    const isDuplicate = profile.presentMedicalConditions.some(c => c.id !== initialData?.id && c.icdCode === processedCondition.icdCode);
    if (isDuplicate) {
        toast({ variant: 'destructive', title: 'Duplicate Condition', description: `A condition with ICD-11 code ${processedCondition.icdCode} already exists.` });
        return;
    }
    
    onSave({
      id: initialData?.id || `cond-${Date.now()}`,
      userInput: data.userInput,
      condition: processedCondition.standardizedName,
      icdCode: processedCondition.icdCode,
      synopsis: processedCondition.synopsis,
      date: data.date.toISOString(),
      status: 'pending_review',
    });
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
            control={form.control}
            name="userInput"
            rules={{ required: "Condition name is required." }}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Condition Name</FormLabel>
                    <FormControl>
                        <Input {...field} ref={inputRef} placeholder="e.g., high blood pressure" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        {processedCondition && (
          <Alert variant="default" className="bg-background">
            <AlertTitle className="font-semibold">AI Suggestion</AlertTitle>
            <AlertDescription>
              <p><strong>Official Name:</strong> {processedCondition.standardizedName}</p>
              <p><strong>ICD-11 Code:</strong> {processedCondition.icdCode}</p>
            </AlertDescription>
          </Alert>
        )}
       
        <div className="flex justify-between items-end gap-4">
            <div className="flex-1">
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
            </div>

            <div className="flex-1 flex justify-center">
              <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
            
            <div className="flex-1 flex justify-end">
              <Button type="submit" size="sm" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {processedCondition ? 'Confirm & Save' : 'Process & Review'}
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
                <p className="text-foreground">
                    <span className="font-semibold">{med.brandName}</span>
                    {med.name.toLowerCase() !== med.brandName.toLowerCase() && (
                        <span className="text-muted-foreground text-xs ml-1">({med.name})</span>
                    )}
                    <span className="text-muted-foreground text-xs ml-2">{formatDetails(med)}</span>
                </p>
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
  const { profile, addMedicalCondition, updateMedicalCondition, removeMedication, setMedicationNil, removeMedicalCondition: removeMedicalConditionFromContext } = useApp();
  const [editingCondition, setEditingCondition] = React.useState<MedicalCondition | null>(null);
  const [showInteraction, setShowInteraction] = React.useState(false);
  const [isEditingConditions, setIsEditingConditions] = React.useState(false);
  const [isEditingMedications, setIsEditingMedications] = React.useState(false);
  const [isConditionDialogOpen, setIsConditionDialogOpen] = React.useState(false);
  const [isAddingMedication, setIsAddingMedication] = React.useState(false);


  const isMedicationNil = profile.medication.length === 1 && profile.medication[0].name.toLowerCase() === 'nil';

  React.useEffect(() => {
    if (!isConditionDialogOpen) {
        setEditingCondition(null);
    }
  }, [isConditionDialogOpen]);
  
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
      setIsConditionDialogOpen(true);
  }

  const handleAddConditionClick = () => {
    setEditingCondition(null);
    setIsConditionDialogOpen(true);
  };
  
  const handleRemoveMedication = (id: string) => {
    removeMedication(id);
  };
  
  const handleSetMedicationNil = () => {
      setMedicationNil();
  }
  
  const formatMedicationDetails = (med: Medication) => {
    const details = [med.dosage, med.frequency, med.foodInstructions ? `${med.foodInstructions} food` : ''].filter(Boolean).join(', ');
    return details ? `(${details})` : '';
  }
  
  const conditionActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleAddConditionClick}>
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
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <MedicalInfoSection
            title="Present Medical Conditions"
            icon={<Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />}
            actions={conditionActions}
        >
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
                <p className="text-xs text-muted-foreground pl-8 pt-2">No conditions recorded.</p>
            )}
        </MedicalInfoSection>
        
        <MedicalInfoSection
            title="Current Medication"
            icon={<Pill className="h-5 w-5 shrink-0 text-muted-foreground" />}
            actions={medicationActions}
        >
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
                <p className="text-xs text-muted-foreground pl-8 pt-2">No medication recorded.</p>
            )}
            {profile.medication.length > 1 && !isMedicationNil && (
                <div className="pt-2">
                    {showInteraction ? (
                        <DrugInteractionViewer
                            medications={profile.medication.map(m => `${m.name} ${m.dosage}`)}
                            onClose={() => setShowInteraction(false)}
                        />
                    ) : (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowInteraction(true)}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Analyze Drug Interactions
                        </Button>
                    )}
                </div>
            )}
        </MedicalInfoSection>
      </div>
        
      <Dialog open={isConditionDialogOpen} onOpenChange={setIsConditionDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingCondition?.id ? "Edit" : "Add"} Medical Condition</DialogTitle>
                  <DialogDescription>
                      Enter a condition and our AI will help standardize it.
                  </DialogDescription>
              </DialogHeader>
              <MedicalConditionForm 
                  onSave={handleSaveCondition} 
                  onCancel={() => setIsConditionDialogOpen(false)} 
                  initialData={editingCondition?.id ? editingCondition : undefined}
              />
          </DialogContent>
      </Dialog>
      <AddMedicationDialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
        {/* This component manages its own trigger, so no children are needed here when opening programmatically */}
      </AddMedicationDialog>
    </>
  );
}

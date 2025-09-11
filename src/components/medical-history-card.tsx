

'use client';

import { Stethoscope, PlusCircle, Loader2, Pill, Info, Trash2, Edit, X, Settings, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AddMedicationForm } from './add-medication-dialog';
import { ConditionSynopsisDialog } from './condition-synopsis-dialog';
import { ActionIcon } from './ui/action-icon';
import { ActionMenu } from './ui/action-menu';

type ActiveView = 'none' | 'addCondition' | 'editCondition' | 'addMedication' | 'interaction' | `synopsis_condition_${string}` | `synopsis_medication_${string}`;

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
    <Card className="mt-2 border-primary border-2">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit' : 'Add'} Medical Condition</CardTitle>
        <CardDescription>Enter a condition and our AI will help standardize it.</CardDescription>
      </CardHeader>
      <CardContent>
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

            {processedCondition && (
            <Alert variant="default" className="bg-background">
                <AlertTitle className="font-semibold">AI Suggestion</AlertTitle>
                <AlertDescription>
                <p><strong>Official Name:</strong> {processedCondition.standardizedName}</p>
                <p><strong>ICD-11 Code:</strong> {processedCondition.icdCode}</p>
                </AlertDescription>
            </Alert>
            )}
        
            <div className="border border-purple-500 pt-4">
                <div className="flex flex-col gap-2 border border-red-500">
                    <Button type="submit" disabled={isProcessing} className="border border-green-500">
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {processedCondition ? 'Confirm & Save' : 'Process & Review'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onCancel} className="border border-blue-500">Cancel</Button>
                </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
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

interface MedicationListItemProps {
    med: Medication;
    isEditing: boolean;
    onRemove: (id: string) => void;
    onShowSynopsis: (id: string) => void;
    formatDetails: (med: Medication) => string;
}

function MedicationListItem({ med, isEditing, onRemove, onShowSynopsis, formatDetails }: MedicationListItemProps) {
    return (
        <li className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
            <div className="flex-1">
            {med.name.toLowerCase() === 'nil' ? (
                <span className="font-semibold text-foreground">Nil - No medication</span>
            ) : (
                <div>
                    <p className="font-semibold text-foreground">{med.name}</p>
                    <p className="text-muted-foreground text-xs italic">
                        Patient Input: "{med.brandName}"
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {formatDetails(med)}
                    </p>
                </div>
            )}
            </div>
                <div className="flex items-center shrink-0">
                    {med.name.toLowerCase() !== 'nil' && (
                        <ActionIcon 
                            tooltip="View Synopsis"
                            icon={<Info className="h-5 w-5 text-blue-500" />}
                            onClick={(e) => { e.stopPropagation(); onShowSynopsis(med.id); }}
                        />
                    )}
                    {isEditing && med.name.toLowerCase() !== 'nil' && (
                         <ActionIcon 
                            tooltip="Delete Medication"
                            icon={<Trash2 className="h-5 w-5 text-destructive" />}
                            onClick={(e) => { e.stopPropagation(); onRemove(med.id); }}
                        />
                    )}
                </div>
        </li>
    )
}

export function MedicalHistoryCard() {
  const { profile, addMedicalCondition, updateMedicalCondition, removeMedication, setMedicationNil, removeMedicalCondition: removeMedicalConditionFromContext } = useApp();
  const [activeView, setActiveView] = React.useState<ActiveView>('none');
  const [activeData, setActiveData] = React.useState<any>(null);

  const [isEditingConditions, setIsEditingConditions] = React.useState(false);
  const [isEditingMedications, setIsEditingMedications] = React.useState(false);
  
  const isMedicationNil = profile.medication.length === 1 && profile.medication[0].name.toLowerCase() === 'nil';
  
  const handleSaveCondition = (condition: MedicalCondition) => {
    if (activeView === 'editCondition') {
        updateMedicalCondition(condition);
    } else {
        const optimisticId = `cond-${Date.now()}`;
        const newCondition = { ...condition, id: optimisticId, status: 'pending_review' as const };
        addMedicalCondition(newCondition);
    }
    setActiveView('none');
    setActiveData(null);
  }

  const handleReviseCondition = (conditionToEdit: MedicalCondition) => {
      setActiveData(conditionToEdit);
      setActiveView('editCondition');
  }

  const handleAddConditionClick = () => {
    setActiveView('addCondition');
    setActiveData(null);
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
    <ActionMenu tooltip="Condition Settings" icon={<Settings className="h-4 w-4" />}>
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
    </ActionMenu>
  );

  const medicationActions = (
    <ActionMenu tooltip="Medication Settings" icon={<Settings className="h-4 w-4" />}>
      {!isMedicationNil && (
        <DropdownMenuItem onSelect={() => setActiveView('addMedication')}>
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
    </ActionMenu>
  );

  const closeActiveView = () => {
    setActiveView('none');
    setActiveData(null);
  }
  
  const showSynopsis = (type: 'condition' | 'medication', data: any) => {
    setActiveView(`synopsis_${type}_${data.id}`);
    setActiveData(data);
  }

  const renderActiveViewContent = () => {
    if (activeView === 'addCondition' || activeView === 'editCondition') {
        return <MedicalConditionForm onSave={handleSaveCondition} onCancel={closeActiveView} initialData={activeData} />;
    }
    if (activeView === 'addMedication') {
        return <AddMedicationForm onCancel={closeActiveView} onSuccess={closeActiveView} />;
    }
    if (activeView === 'interaction') {
        return <DrugInteractionViewer medications={profile.medication.map(m => `${m.name} ${m.dosage}`)} onClose={closeActiveView} />;
    }
    if (activeView.startsWith('synopsis_condition_')) {
      return (
        <div className="pl-5 pb-2">
            <ConditionSynopsisDialog
                conditionName={activeData.condition}
                initialSynopsis={activeData.synopsis}
                onClose={closeActiveView}
            />
        </div>
      )
    }
     if (activeView.startsWith('synopsis_medication_')) {
      return (
         <div className="pl-5 pb-2">
            <MedicationSynopsisDialog
                medicationName={activeData.name}
                onClose={closeActiveView}
            />
        </div>
      )
    }
    return null;
  }

  const activeViewContent = renderActiveViewContent();

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
                                onShowSynopsis={() => showSynopsis('condition', condition)}
                            />
                        )
                    })}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground pl-8 pt-2">No conditions recorded.</p>
            )}
            {activeView === 'addCondition' || activeView === 'editCondition' ? activeViewContent : null}
            {activeView.startsWith('synopsis_condition_') ? activeViewContent : null}
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
                            onShowSynopsis={() => showSynopsis('medication', med)}
                            formatDetails={formatMedicationDetails}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-muted-foreground pl-8 pt-2">No medication recorded.</p>
            )}

            {activeView === 'addMedication' ? activeViewContent : null}
            {activeView.startsWith('synopsis_medication_') ? activeViewContent : null}
            
            {profile.medication.length > 1 && !isMedicationNil && (
                <div className="pt-2">
                    {activeView === 'interaction' ? (
                        activeViewContent
                    ) : (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveView('interaction')}>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Analyze Drug Interactions
                        </Button>
                    )}
                </div>
            )}
        </MedicalInfoSection>
      </div>
    </>
  );
}

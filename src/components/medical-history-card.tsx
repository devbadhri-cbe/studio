
'use client';

import { Stethoscope, PlusCircle, Loader2, Pill, Info, Trash2, Edit, X, Settings, ShieldAlert, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { DrugInteractionViewer } from './drug-interaction-viewer';
import { MedicationSynopsisDialog } from './medication-synopsis-dialog';
import type { MedicalCondition, Medication } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { AddMedicationForm } from './add-medication-dialog';
import { AddMedicalConditionForm } from './add-medical-condition-dialog';
import { ConditionSynopsisDialog } from './condition-synopsis-dialog';
import { ActionIcon } from './ui/action-icon';
import { ActionMenu } from './ui/action-menu';
import { processMedicalCondition } from '@/ai/flows/process-medical-condition-flow';
import { getMedicationInfo } from '@/ai/flows/process-medication-flow';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Alert, AlertDescription } from './ui/alert';
import { produce } from 'immer';
import { EditMedicationForm } from './edit-medication-form';
import { useIsMobile } from '@/hooks/use-is-mobile';

type ActiveView = 'none' | `add_${'condition' | 'medication'}` | `edit_${'condition' | 'medication'}_${string}` | 'interaction' | `synopsis_${'condition' | 'medication'}_${string}`;


interface MedicalInfoSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actions: React.ReactNode;
  isAdding: boolean;
  onAdd: () => void;
  form: React.ReactNode;
}

function MedicalInfoSection({ title, icon, actions, children, isAdding, onAdd, form }: MedicalInfoSectionProps) {
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
            {isAdding && form}
            {children}
        </CardContent>
    </Card>
  )
}

// Unified List Item Component
interface ListItemProps {
    item: MedicalCondition | Medication;
    type: 'condition' | 'medication';
    isEditing: boolean;
    isFormOpen: boolean;
    onRemove: (id: string) => void;
    onShowSynopsis: (id: string) => void;
    onProcess: (item: any) => void;
    onRevise?: (item: any) => void;
    form: React.ReactNode;
}

function ListItem({ item, type, isEditing, isFormOpen, onRemove, onShowSynopsis, onProcess, onRevise, form }: ListItemProps) {
    const formatDate = useDateFormatter();
    const isMobile = useIsMobile();
    
    const isPending = item.status === 'pending_review';
    const isFailed = item.status === 'failed';

    let title: string;
    let details: string | null = null;
    let originalInput: string | undefined;
    let date: string | undefined;
    let isNil = false;

    if (type === 'condition') {
        const cond = item as MedicalCondition;
        title = cond.condition;
        originalInput = cond.userInput;
        date = cond.date;
    } else {
        const med = item as Medication;
        isNil = med.name.toLowerCase() === 'nil - no medication taken';
        title = isNil ? 'Nil - No medication taken' : med.name;
        originalInput = med.userInput;
        if (!isNil && med.status !== 'failed') {
            details = [med.dosage, med.frequency, med.foodInstructions ? `${med.foodInstructions} food` : ''].filter(Boolean).join(', ');
        }
    }
    
    const handleItemClick = () => {
        if (isFailed) onProcess(item);
        if (isMobile && !isNil && !isFailed && !isPending && type === 'medication') {
            onShowSynopsis(item.id);
        }
    }
    
    const showOriginalInput = originalInput && originalInput.toLowerCase() !== title.toLowerCase() && !isNil;

    const itemBorderColor = isPending ? "border-yellow-500" : isFailed ? "border-destructive" : "border-primary";
    const itemCursor = isFailed || (isMobile && type === 'medication' && !isNil && !isFailed && !isPending) ? "cursor-pointer" : "";


    return (
        <li>
        <div
            className={cn(
                "group flex flex-col text-xs text-muted-foreground border-l-2 pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md",
                itemBorderColor,
                itemCursor
            )}
            onClick={handleItemClick}
        >
            <div className="flex items-start gap-2 w-full">
                <div className="flex-1">
                    <p className="font-semibold text-foreground">{title}</p>
                     {showOriginalInput && <p className="text-muted-foreground text-xs">({originalInput})</p>}
                    
                    {isPending ? (
                        <div className="flex items-center gap-1.5 mt-1">
                            <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                            <p className="text-muted-foreground text-xs italic">Pending AI processing...</p>
                        </div>
                    ) : isFailed ? (
                        <div className="flex items-center gap-1.5 mt-1">
                            <AlertTriangleIcon className="h-3 w-3 text-destructive" />
                            <p className="text-destructive text-xs italic">AI failed. Click to retry.</p>
                        </div>
                    ) : (
                        <>
                            {details && <p className="text-muted-foreground text-xs mt-1">{details}</p>}
                            {date && <p className="text-xs text-muted-foreground">{formatDate(date)}</p>}
                        </>
                    )}
                </div>

                <div className="flex items-center shrink-0">
                    {isFailed && (
                         <ActionIcon 
                            tooltip={`Delete Failed Record`}
                            icon={<Trash2 className="h-5 w-5 text-destructive" />}
                            onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                        />
                    )}
                    {!isPending && !isNil && !isFailed && (
                        <>
                            <ActionIcon 
                                tooltip="View Synopsis"
                                icon={<Info className="h-5 w-5 text-blue-500" />}
                                onClick={(e) => { e.stopPropagation(); onShowSynopsis(item.id); }}
                                className={isMobile ? 'hidden' : 'flex'}
                            />
                            {isEditing && onRevise && (
                                <ActionIcon 
                                    tooltip={`Edit ${type}`}
                                    icon={<Edit className="h-5 w-5 text-gray-500" />}
                                    onClick={(e) => { e.stopPropagation(); onRevise(item); }}
                                />
                            )}
                            {isEditing && (
                                <ActionIcon 
                                    tooltip={`Delete ${type}`}
                                    icon={<Trash2 className="h-5 w-5 text-destructive" />}
                                    onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {(item as MedicalCondition).status === 'needs_revision' && onRevise && (
                <div className="mt-2 w-full">
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive text-xs p-2">
                    <AlertTriangleIcon className="h-4 w-4 !text-destructive" />
                    <AlertDescription className="flex items-center justify-between">
                    Doctor requested revision.
                    <Button size="xs" className="ml-2" onClick={() => onRevise(item)}>
                        <Edit className="mr-1 h-3 w-3" />
                        Revise
                    </Button>
                    </AlertDescription>
                </Alert>
                </div>
            )}
        </div>
        {isFormOpen && <div className="mt-2">{form}</div>}
        </li>
    );
}


export function MedicalHistoryCard() {
  const { profile, addMedicalCondition, updateMedicalCondition, removeMedication, removeMedicalCondition: removeMedicalConditionFromContext, updateMedication } = useApp();
  const [activeView, setActiveView] = React.useState<ActiveView>('none');
  
  const [isEditingConditions, setIsEditingConditions] = React.useState(false);
  const [isEditingMedications, setIsEditingMedications] = React.useState(false);
  
  const handleProcessCondition = async (condition: MedicalCondition) => {
    toast({ title: "Re-processing Condition...", description: `Asking AI about "${condition.userInput}"`});
    updateMedicalCondition(produce(condition, draft => { draft.status = 'pending_review' }));
    try {
      const result = await processMedicalCondition({ condition: condition.userInput || '' });
      if (result.isValid && result.standardizedName && result.icdCode) {
        updateMedicalCondition({
            ...condition,
            condition: result.standardizedName,
            icdCode: result.icdCode,
            synopsis: result.synopsis || '',
            status: 'processed',
        });
        toast({ title: 'Condition Processed', description: `AI identified: ${result.standardizedName}` });
      } else {
        updateMedicalCondition(produce(condition, draft => { draft.status = 'failed' }));
        toast({ variant: 'destructive', title: 'Condition Not Recognized', description: `Suggestions: ${result.suggestions?.join(', ') || 'Please check spelling.'}.` });
      }
    } catch(e) {
      console.error(e);
      updateMedicalCondition(produce(condition, draft => { draft.status = 'failed' }));
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process condition.' });
    }
  }

  const handleProcessMedication = async (med: Medication) => {
    toast({ title: "Re-processing Medication...", description: `Asking AI about "${med.userInput}"`});
    updateMedication(produce(med, draft => { draft.status = 'pending_review' }));
     try {
      const result = await getMedicationInfo({ 
        userInput: med.userInput,
        frequency: med.frequency,
        foodInstructions: med.foodInstructions,
      });
      const updatedMed = produce(med, draft => {
        if (result.activeIngredient) {
            draft.name = result.activeIngredient;
            draft.dosage = result.dosage || med.dosage;
            draft.frequency = result.frequency || med.frequency;
            draft.foodInstructions = result.foodInstructions || med.foodInstructions;
            draft.status = 'processed';
            (draft as any).spellingSuggestion = result.spellingSuggestion;
            toast({ title: "Medication Processed", description: `AI identified: ${result.activeIngredient}`});
        } else {
            draft.status = 'failed';
            toast({ variant: 'destructive', title: 'Could not identify medication.' });
        }
      });
      updateMedication(updatedMed);
    } catch(e) {
      console.error(e);
      updateMedication(produce(med, draft => { draft.status = 'failed' }));
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process medication.' });
    }
  }

  const closeActiveView = () => {
    setActiveView('none');
  }

  const renderSynopsisDialog = () => {
    const parts = activeView.split('_');
    if (parts.length < 3) return null;
    const type = parts[1];
    const id = parts[2];
    
    if (type === 'condition') {
        const data = profile.presentMedicalConditions.find(c => c.id === id);
        if (!data) return null;
        return (
            <ConditionSynopsisDialog
                conditionName={data.condition}
                initialSynopsis={data.synopsis}
                onClose={closeActiveView}
            />
        );
    }
     if (type === 'medication') {
        const data = profile.medication.find(m => m.id === id);
        if (!data) return null;
        return (
             <MedicationSynopsisDialog
                medicationName={data.name}
                onClose={closeActiveView}
            />
        );
    }
    return null;
  }
  
  
  const conditionActions = (
    <ActionMenu tooltip="Condition Settings" icon={<Settings className="h-4 w-4" />}>
      <DropdownMenuItem onSelect={() => setActiveView('add_condition')}>
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
        <DropdownMenuItem onSelect={() => setActiveView('add_medication')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Medication
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => setIsEditingMedications(!isEditingMedications)}
          disabled={profile.medication.length === 0}
        >
          <Edit className="mr-2 h-4 w-4" />
          {isEditingMedications ? 'Done Editing' : 'Edit List'}
        </DropdownMenuItem>
         {profile.medication.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setActiveView('interaction')}>
                <ShieldAlert className="mr-2 h-4 w-4" />
                Check Interactions
              </DropdownMenuItem>
            </>
          )}
    </ActionMenu>
  );


  const nilMedicationRecord: Medication = {
    id: 'nil',
    name: 'Nil - No medication taken',
    userInput: 'Nil',
    dosage: '',
    frequency: '',
    status: 'processed'
  };

  return (
    <>
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <MedicalInfoSection
            title="Present Medical Conditions"
            icon={<Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />}
            actions={conditionActions}
            isAdding={activeView === 'add_condition'}
            onAdd={() => setActiveView('add_condition')}
            form={<AddMedicalConditionForm onSave={updateMedicalCondition} onCancel={closeActiveView} />}
        >
            <ul className="space-y-1 mt-2">
                {profile.presentMedicalConditions.length > 0 ? (
                    profile.presentMedicalConditions.map((condition) => {
                        if (!condition || !condition.id) return null;
                        const isEditingThis = activeView === `edit_condition_${condition.id}`;
                        return (
                            <ListItem
                                key={condition.id}
                                item={condition}
                                type="condition"
                                isEditing={isEditingConditions}
                                isFormOpen={isEditingThis}
                                onRemove={() => removeMedicalConditionFromContext(condition.id)}
                                onShowSynopsis={() => setActiveView(`synopsis_condition_${condition.id}`)}
                                onProcess={handleProcessCondition}
                                onRevise={() => setActiveView(`edit_condition_${condition.id}`)}
                                form={<AddMedicalConditionForm onCancel={closeActiveView} initialData={condition} onSave={updateMedicalCondition}/>}
                            />
                        )
                    })
                ) : (
                    activeView !== 'add_condition' && <p className="text-xs text-muted-foreground pl-8 pt-2">No conditions recorded.</p>
                )}
            </ul>
            {activeView.startsWith('synopsis_condition_') && renderSynopsisDialog()}
        </MedicalInfoSection>
        
        <MedicalInfoSection
            title="Current Medication"
            icon={<Pill className="h-5 w-5 shrink-0 text-muted-foreground" />}
            actions={medicationActions}
            isAdding={activeView === 'add_medication'}
            onAdd={() => setActiveView('add_medication')}
            form={<AddMedicationForm onCancel={closeActiveView} />}
        >
            <ul className="space-y-1 mt-2">
                {profile.medication.length > 0 ? (
                    profile.medication.map((med) => {
                        const isEditingThis = activeView === `edit_medication_${med.id}`;
                        return (
                           <ListItem
                                key={med.id}
                                item={med}
                                type="medication"
                                isEditing={isEditingMedications}
                                isFormOpen={isEditingThis}
                                onRemove={() => removeMedication(med.id)}
                                onShowSynopsis={() => setActiveView(`synopsis_medication_${med.id}`)}
                                onProcess={handleProcessMedication}
                                onRevise={() => setActiveView(`edit_medication_${med.id}`)}
                                form={<EditMedicationForm onCancel={closeActiveView} initialData={med} onSuccess={(editedData) => {
                                    const finalMed = { ...med, ...editedData, name: editedData.activeIngredient };
                                    updateMedication(finalMed);
                                    closeActiveView();
                                }}/>}
                            />
                        )
                    })
                ) : (
                     activeView !== 'add_medication' && (
                        <ListItem
                            item={nilMedicationRecord}
                            type="medication"
                            isEditing={false}
                            isFormOpen={false}
                            onRemove={() => {}}
                            onShowSynopsis={() => {}}
                            onProcess={() => {}}
                            form={null}
                        />
                    )
                )}
            </ul>

            {activeView.startsWith('synopsis_medication_') && renderSynopsisDialog()}
            
            {activeView === 'interaction' && (
                 <DrugInteractionViewer medications={profile.medication.map(m => m.userInput)} onClose={closeActiveView} />
            )}
        </MedicalInfoSection>
      </div>
    </>
  );
}

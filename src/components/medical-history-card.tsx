
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

type ActiveView = 'none' | 'addCondition' | 'editCondition' | 'addMedication' | 'interaction' | `synopsis_condition_${string}` | `synopsis_medication_${string}`;

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

// Unified List Item Component
interface ListItemProps {
    item: MedicalCondition | Medication;
    type: 'condition' | 'medication';
    isEditing: boolean;
    onRemove: (id: string) => void;
    onShowSynopsis: (id: string) => void;
    onProcess: (item: any) => void;
    onRevise?: (item: any) => void;
}

function ListItem({ item, type, isEditing, onRemove, onShowSynopsis, onProcess, onRevise }: ListItemProps) {
    const formatDate = useDateFormatter();
    
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
        isNil = med.name.toLowerCase() === 'nil';
        title = isNil ? 'Nil - No medication taken' : med.name;
        originalInput = med.userInput;
        if (!isNil && med.status !== 'failed') {
            details = [med.dosage, med.frequency, med.foodInstructions ? `${med.foodInstructions} food` : ''].filter(Boolean).join(', ');
        }
    }
    
    const handleItemClick = () => {
        if (isFailed) onProcess(item);
    }
    
    const showOriginalInput = originalInput && originalInput.toLowerCase() !== title.toLowerCase() && !isNil;

    const itemBorderColor = isPending ? "border-yellow-500" : isFailed ? "border-destructive" : "border-primary";
    const itemCursor = isFailed ? "cursor-pointer" : "";

    return (
        <li
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

                {!isPending && !isNil && !isFailed && (
                    <div className="flex items-center shrink-0">
                         <ActionIcon 
                            tooltip="View Synopsis"
                            icon={<Info className="h-5 w-5 text-blue-500" />}
                            onClick={(e) => { e.stopPropagation(); onShowSynopsis(item.id); }}
                        />
                        {isEditing && (
                            <ActionIcon 
                                tooltip={`Delete ${type}`}
                                icon={<Trash2 className="h-5 w-5 text-destructive" />}
                                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                            />
                        )}
                    </div>
                )}
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
        </li>
    );
}


export function MedicalHistoryCard() {
  const { profile, addMedicalCondition, updateMedicalCondition, removeMedication, removeMedicalCondition: removeMedicalConditionFromContext, updateMedication } = useApp();
  const [activeView, setActiveView] = React.useState<ActiveView>('none');
  const [activeData, setActiveData] = React.useState<any>(null);

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
      if (result.activeIngredient) {
        updateMedication({
             ...med,
             name: result.activeIngredient,
             dosage: result.dosage || med.dosage,
             frequency: result.frequency || med.frequency,
             foodInstructions: result.foodInstructions || med.foodInstructions,
             userInput: result.correctedMedicationName || med.userInput,
             status: 'processed',
        });
        toast({ title: "Medication Processed", description: `AI identified: ${result.activeIngredient}`});
      } else {
        updateMedication(produce(med, draft => { draft.status = 'failed' }));
        toast({ variant: 'destructive', title: 'Could not identify medication.' });
      }
    } catch(e) {
      console.error(e);
      updateMedication(produce(med, draft => { draft.status = 'failed' }));
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process medication.' });
    }
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
        <DropdownMenuItem onSelect={() => setActiveView('addMedication')}>
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
        return <AddMedicalConditionForm onCancel={closeActiveView} initialData={activeData} />;
    }
    if (activeView === 'addMedication') {
        return <AddMedicationForm onCancel={closeActiveView} onSuccess={closeActiveView} />;
    }
    if (activeView === 'interaction') {
        return <DrugInteractionViewer medications={profile.medication.map(m => m.userInput)} onClose={closeActiveView} />;
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
        >
            {activeView === 'addCondition' || activeView === 'editCondition' ? activeViewContent : null}
            {profile.presentMedicalConditions.length > 0 ? (
                <ul className="space-y-1 mt-2">
                    {profile.presentMedicalConditions.map((condition) => {
                        if (!condition || !condition.id) return null;
                        return (
                            <ListItem
                                key={condition.id}
                                item={condition}
                                type="condition"
                                isEditing={isEditingConditions}
                                onRemove={() => removeMedicalConditionFromContext(condition.id)}
                                onShowSynopsis={() => showSynopsis('condition', condition)}
                                onProcess={handleProcessCondition}
                                onRevise={handleReviseCondition}
                            />
                        )
                    })}
                </ul>
            ) : (
                activeView !== 'addCondition' && activeView !== 'editCondition' && <p className="text-xs text-muted-foreground pl-8 pt-2">No conditions recorded.</p>
            )}
            {activeView.startsWith('synopsis_condition_') ? activeViewContent : null}
        </MedicalInfoSection>
        
        <MedicalInfoSection
            title="Current Medication"
            icon={<Pill className="h-5 w-5 shrink-0 text-muted-foreground" />}
            actions={medicationActions}
        >
            {activeView === 'addMedication' ? activeViewContent : null}
            <ul className="space-y-1 mt-2">
                {profile.medication.length > 0 ? (
                    profile.medication.map((med) => (
                       <ListItem
                            key={med.id}
                            item={med}
                            type="medication"
                            isEditing={isEditingMedications}
                            onRemove={handleRemoveMedication}
                            onShowSynopsis={() => showSynopsis('medication', med)}
                            onProcess={handleProcessMedication}
                        />
                    ))
                ) : (
                    <ListItem
                        item={nilMedicationRecord}
                        type="medication"
                        isEditing={false}
                        onRemove={() => {}}
                        onShowSynopsis={() => {}}
                        onProcess={() => {}}
                    />
                )}
            </ul>

            {activeView.startsWith('synopsis_medication_') ? activeViewContent : null}
            
            {profile.medication.length > 1 && (
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

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
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Alert, AlertDescription } from './ui/alert';
import { produce } from 'immer';
import { EditMedicationForm } from './edit-medication-form';
import { useIsMobile } from '@/hooks/use-is-mobile';

type ActiveView = 'none' | `add` | `edit_${string}` | `synopsis_${string}`;


interface MedicalInfoSectionProps<T extends MedicalCondition | Medication> {
  title: string;
  icon: React.ReactNode;
  items: T[];
  type: 'condition' | 'medication';
  onShowSynopsis: (id: string) => void;
  onProcessItem: (item: T) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (item: T) => void;
  onAddItem: (item: Omit<T, 'id'>) => void;
  isNil?: boolean;
  nilRecord?: T;
  AddForm: React.ComponentType<{ onSave: (data: any) => void; onCancel: () => void; initialData?: T }>;
  EditForm: React.ComponentType<{ onSave: (data: any) => void; onCancel: () => void; initialData: T; }>;
  extraActions?: React.ReactNode;
}


function MedicalInfoSection<T extends MedicalCondition | Medication>({ 
    title, icon, items, type, onShowSynopsis, onProcessItem, onRemoveItem, onUpdateItem, isNil, nilRecord, AddForm, EditForm, extraActions
}: MedicalInfoSectionProps<T>) {
    const [activeView, setActiveView] = React.useState<ActiveView>('none');
    const [isEditingList, setIsEditingList] = React.useState(false);

    const handleSaveNew = (data: any) => {
        onUpdateItem(data);
        setActiveView('none');
    };
    
    const actions = (
        <ActionMenu tooltip={`${title} Settings`} icon={<Settings className="h-4 w-4" />}>
            <DropdownMenuItem onSelect={() => setActiveView('add')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add {type === 'condition' ? 'Condition' : 'Medication'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setIsEditingList(!isEditingList)}
              disabled={items.length === 0}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditingList ? 'Done Editing' : 'Edit List'}
            </DropdownMenuItem>
            {extraActions}
        </ActionMenu>
    );

    const handleAddFormCancel = () => setActiveView('none');
    const handleEditFormCancel = () => setActiveView('none');

    const handleAddFormSave = (data: Omit<T, 'id'>) => {
        onAddItem(data);
        setActiveView('none');
    }

    const handleEditFormSave = (data: T) => {
        onUpdateItem(data);
        setActiveView('none');
    }

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
                {activeView === 'add' && <AddForm onSave={handleAddFormSave as any} onCancel={handleAddFormCancel} />}
                <ul className="space-y-1 mt-2">
                    {items.length > 0 ? items.map((item) => {
                        const isEditingThis = activeView === `edit_${item.id}`;
                        return (
                            <ListItem
                                key={item.id}
                                item={item}
                                type={type}
                                isEditing={isEditingList}
                                isFormOpen={isEditingThis}
                                onRemove={onRemoveItem}
                                onShowSynopsis={onShowSynopsis}
                                onProcess={onProcessItem}
                                onRevise={() => setActiveView(`edit_${item.id}`)}
                                form={<EditForm onCancel={handleEditFormCancel} initialData={item} onSave={handleEditFormSave as any}/>}
                            />
                        )
                    }) : (isNil && nilRecord) ? (
                        <ListItem
                            item={nilRecord}
                            type={type}
                            isEditing={false}
                            isFormOpen={false}
                            onRemove={() => {}}
                            onShowSynopsis={() => {}}
                            onProcess={() => {}}
                            form={null}
                        />
                    ) : null}
                    {items.length === 0 && !isNil && activeView !== 'add' && <p className="text-xs text-muted-foreground pl-8 pt-2">No {type === 'condition' ? 'conditions' : 'medications'} recorded.</p>}
                </ul>
            </CardContent>
        </Card>
    );
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
        if (isFailed) {
            onProcess(item);
        } else if (isMobile && type === 'medication' && !isNil && !isFailed && !isPending) {
            // On mobile, tapping the item shows the synopsis.
            onShowSynopsis(item.id);
        }
    }
    
    const showOriginalInput = originalInput && originalInput.toLowerCase() !== title.toLowerCase() && !isNil;

    const itemBorderColor = isNil ? 'border-transparent' : isPending ? "border-yellow-500" : isFailed ? "border-destructive" : "border-primary";
    const itemCursor = isFailed || (isMobile && type === 'medication' && !isNil && !isFailed && !isPending) ? "cursor-pointer" : "cursor-default";


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
                    {isFailed && !isNil &&(
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
  const { profile, updateMedicalCondition, removeMedication, removeMedicalCondition, addMedication, addMedicalCondition, updateMedication } = useApp();
  const [activeSynopsis, setActiveSynopsis] = React.useState<{ type: 'condition' | 'medication', id: string } | null>(null);
  const [activeInteractionCheck, setActiveInteractionCheck] = React.useState(false);

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
      // Reprocessing a medication is handled by the AddMedicationForm's reprocessing mode
      // For this prototype, we'll just show a toast
      toast({title: 'Not Implemented', description: 'Please use the "Add Medication" form to re-process failed entries for now.'});
  }

  const renderSynopsisDialog = () => {
    if (!activeSynopsis) return null;
    const { type, id } = activeSynopsis;
    
    if (type === 'condition') {
        const data = profile.presentMedicalConditions.find(c => c.id === id);
        if (!data) return null;
        return (
            <ConditionSynopsisDialog
                conditionName={data.condition}
                initialSynopsis={data.synopsis}
                onClose={() => setActiveSynopsis(null)}
            />
        );
    }
     if (type === 'medication') {
        const data = profile.medication.find(m => m.id === id);
        if (!data) return null;
        return (
             <MedicationSynopsisDialog
                medicationName={data.name}
                onClose={() => setActiveSynopsis(null)}
            />
        );
    }
    return null;
  }
  
  const nilMedicationRecord: Medication = {
    id: 'nil',
    name: 'Nil - No medication taken',
    userInput: 'Nil',
    dosage: '',
    frequency: '',
    status: 'processed'
  };

  const medicationExtraActions = profile.medication.length > 1 ? (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => setActiveInteractionCheck(true)}>
        <ShieldAlert className="mr-2 h-4 w-4" />
        Check Interactions
      </DropdownMenuItem>
    </>
  ) : null;
  
  const EditMedicationWrapper = (props: any) => (
    <EditMedicationForm {...props} onSuccess={(editedData) => {
        const finalMed = { ...props.initialData, ...editedData, name: editedData.activeIngredient };
        updateMedication(finalMed);
        props.onCancel();
    }}/>
  );
  
  return (
    <>
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <MedicalInfoSection
            title="Present Medical Conditions"
            icon={<Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />}
            items={profile.presentMedicalConditions || []}
            type="condition"
            onShowSynopsis={(id) => setActiveSynopsis({ type: 'condition', id })}
            onProcessItem={handleProcessCondition}
            onRemoveItem={removeMedicalCondition}
            onUpdateItem={updateMedicalCondition}
            onAddItem={addMedicalCondition}
            AddForm={AddMedicalConditionForm}
            EditForm={AddMedicalConditionForm as any}
        />
        
        <MedicalInfoSection
            title="Current Medication"
            icon={<Pill className="h-5 w-5 shrink-0 text-muted-foreground" />}
            items={profile.medication || []}
            type="medication"
            onShowSynopsis={(id) => setActiveSynopsis({ type: 'medication', id })}
            onProcessItem={handleProcessMedication}
            onRemoveItem={removeMedication}
            onUpdateItem={updateMedication}
            onAddItem={addMedication}
            isNil={profile.medication?.length === 0 && profile.status !== 'On Track'}
            nilRecord={nilMedicationRecord}
            AddForm={AddMedicationForm as any}
            EditForm={EditMedicationWrapper as any}
            extraActions={medicationExtraActions}
        />
      </div>
      {activeSynopsis && renderSynopsisDialog()}
      {activeInteractionCheck && (
         <DrugInteractionViewer medications={profile.medication.map(m => m.userInput)} onClose={() => setActiveInteractionCheck(false)} />
      )}
    </>
  );
}

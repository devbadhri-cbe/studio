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
import { v4 as uuidv4 } from 'uuid';

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
  nilRecord?: T;
  AddForm: React.ComponentType<{ onSave: (data: any) => void; onCancel: () => void; initialData?: T }>;
  EditForm?: React.ComponentType<{ onSave: (data: any) => void; onCancel: () => void; initialData: T; }>;
}


function MedicalInfoSection<T extends MedicalCondition | Medication>({ 
    title, icon, items, type, onShowSynopsis, onProcessItem, onRemoveItem, onUpdateItem, onAddItem, nilRecord, AddForm, EditForm
}: MedicalInfoSectionProps<T>) {
    const [activeView, setActiveView] = React.useState<ActiveView>('none');
    const [isEditingList, setIsEditingList] = React.useState(false);
    const [isCheckingInteractions, setIsCheckingInteractions] = React.useState(false);

    const handleSaveNew = (data: any) => {
        onUpdateItem(data);
        setActiveView('none');
    };
    
    const medicationExtraActions = type === 'medication' && items.length > 1 ? (
        <>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setIsCheckingInteractions(true)}>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Check Interactions
        </DropdownMenuItem>
        </>
    ) : null;
    
    const actions = (
        <ActionMenu tooltip={`${title} Settings`} icon={<Settings className="h-4 w-4" />}>
            <DropdownMenuItem onSelect={() => setActiveView('add')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add {type === 'condition' ? 'Condition' : 'Medication'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setIsEditingList(!isEditingList)}
              disabled={items.length === 0 && !nilRecord}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditingList ? 'Done Editing' : 'Edit List'}
            </DropdownMenuItem>
            {medicationExtraActions}
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

                {isCheckingInteractions ? (
                     <DrugInteractionViewer
                        medications={items.map(m => (m as Medication).userInput)}
                        onClose={() => setIsCheckingInteractions(false)}
                    />
                ) : (
                <>
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
                                    onRevise={EditForm ? () => setActiveView(`edit_${item.id}`) : undefined}
                                    form={EditForm ? <EditForm onCancel={handleEditFormCancel} initialData={item} onSave={handleEditFormSave as any}/> : null}
                                />
                            )
                        }) : nilRecord ? (
                             <ListItem
                                item={nilRecord}
                                type={type}
                                isEditing={isEditingList}
                                isFormOpen={false}
                                onRemove={() => onRemoveItem(nilRecord.id)}
                                onShowSynopsis={() => {}}
                                onProcess={() => {}}
                                form={null}
                                isNilItem={true}
                            />
                        ) : null}
                        {items.length === 0 && !nilRecord && activeView !== 'add' && <p className="text-xs text-muted-foreground pl-8 pt-2">No {type === 'condition' ? 'conditions' : 'medications'} recorded.</p>}
                    </ul>
                </>
                )}
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
    isNilItem?: boolean;
}

function ListItem({ item, type, isEditing, isFormOpen, onRemove, onShowSynopsis, onProcess, onRevise, form, isNilItem = false }: ListItemProps) {
    const formatDate = useDateFormatter();
    const isMobile = useIsMobile();
    
    const isPending = item.status === 'pending_review';
    const isFailed = item.status === 'failed';

    let title: string;
    let details: string | null = null;
    let originalInput: string | undefined;
    let date: string | undefined;

    if (type === 'condition') {
        const cond = item as MedicalCondition;
        title = cond.condition;
        originalInput = cond.userInput;
        date = cond.date;
    } else {
        const med = item as Medication;
        title = isNilItem ? 'Nil - No medication taken' : med.name;
        originalInput = med.userInput;
        if (!isNilItem && med.status !== 'failed') {
            details = [med.dosage, med.frequency, med.foodInstructions ? `${med.foodInstructions} food` : ''].filter(Boolean).join(', ');
        }
    }
    
    const handleItemClick = () => {
        if (isFailed || isPending) {
            onProcess(item);
        } else if (isMobile && type === 'medication' && !isNilItem && !isFailed && !isPending) {
            // On mobile, tapping the item shows the synopsis.
            onShowSynopsis(item.id);
        }
    }
    
    const showOriginalInput = originalInput && originalInput.toLowerCase() !== title.toLowerCase() && !isNilItem;

    const itemBorderColor = isNilItem ? 'border-transparent' : isPending ? "border-yellow-500" : isFailed ? "border-destructive" : "border-primary";
    const itemCursor = (isFailed || isPending) ? "cursor-pointer" : (isMobile && type === 'medication' && !isNilItem && !isFailed && !isPending) ? "cursor-pointer" : "cursor-default";


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
                            <p className="text-yellow-600 text-xs italic">Pending AI processing...</p>
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
                    {isEditing && (
                        <>
                            {onRevise && !isNilItem && (
                                <ActionIcon 
                                    tooltip={`Edit ${type}`}
                                    icon={<Edit className="h-5 w-5 text-gray-500" />}
                                    onClick={(e) => { e.stopPropagation(); onRevise(item); }}
                                />
                            )}
                            <ActionIcon 
                                tooltip={`Delete ${type}`}
                                icon={<Trash2 className="h-5 w-5 text-destructive" />}
                                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                            />
                        </>
                    )}
                    {!isEditing && !isPending && !isNilItem && !isFailed && item.synopsis && (
                        <ActionIcon 
                            tooltip="View Synopsis"
                            icon={<Info className="h-5 w-5 text-blue-500" />}
                            onClick={(e) => { e.stopPropagation(); onShowSynopsis(item.id); }}
                        />
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
  const { profile, updateMedicalCondition, removeMedication, removeMedicalCondition, addMedicalCondition, addMedication, updateMedication } = useApp();
  const [activeSynopsis, setActiveSynopsis] = React.useState<{ type: 'condition' | 'medication', id: string } | null>(null);
  const addMedicationFormRef = React.useRef<{ startReprocessing: (med: Medication) => void }>(null);


  const handleProcessCondition = async (condition: MedicalCondition) => {
    if (condition.status === 'processed') return; // Don't re-process if already done
    toast({ title: "Processing Condition...", description: `Asking AI about "${condition.userInput}"`});
    
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
    if (addMedicationFormRef.current) {
        addMedicationFormRef.current.startReprocessing(med);
    } else {
        toast({title: 'Error', description: 'Cannot reprocess at the moment. Please try again.', variant: 'destructive'});
    }
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

  const EditMedicationWrapper = (props: any) => (
    <EditMedicationForm {...props} onSuccess={(editedData) => {
        const finalMed = { ...props.initialData, ...editedData, name: editedData.activeIngredient };
        updateMedication(finalMed);
        props.onCancel();
    }}/>
  );
  
  const handleRemoveNilMedication = () => {
    // A bit of a hack: add and then immediately remove a 'nil' medication
    // This tells the app context that the user has interacted and no longer wants the nil placeholder
    const nilMed: Omit<Medication, 'id'> = {
        name: 'Nil',
        userInput: 'Nil',
        dosage: '',
        frequency: '',
        status: 'processed'
    };
    addMedication(nilMed);

    setTimeout(() => {
        const addedNilMed = profile.medication.find(m => m.name === 'Nil');
        if (addedNilMed) {
            removeMedication(addedNilMed.id);
        }
    }, 50);
  }
  
  const handleAddCondition = (data: Omit<MedicalCondition, 'id' | 'status' | 'synopsis' | 'icdCode'>) => {
      const newCondition: MedicalCondition = {
          ...data,
          id: uuidv4(),
          status: 'pending_review',
      };
      addMedicalCondition(newCondition);
      handleProcessCondition(newCondition);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MedicalInfoSection
            title="Present Medical Conditions"
            icon={<Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />}
            items={profile.presentMedicalConditions || []}
            type="condition"
            onShowSynopsis={(id) => setActiveSynopsis({ type: 'condition', id })}
            onProcessItem={handleProcessCondition}
            onRemoveItem={removeMedicalCondition}
            onUpdateItem={updateMedicalCondition}
            onAddItem={handleAddCondition}
            AddForm={AddMedicalConditionForm as any}
            EditForm={AddMedicalConditionForm as any}
        />
        
        <MedicalInfoSection
            title="Current Medication"
            icon={<Pill className="h-5 w-5 shrink-0 text-muted-foreground" />}
            items={profile.medication || []}
            type="medication"
            onShowSynopsis={(id) => setActiveSynopsis({ type: 'medication', id })}
            onProcessItem={handleProcessMedication}
            onRemoveItem={(id) => {
                if(id === 'nil') {
                    handleRemoveNilMedication();
                } else {
                    removeMedication(id);
                }
            }}
            onUpdateItem={updateMedication}
            onAddItem={addMedication}
            nilRecord={profile.medication?.length === 0 ? nilMedicationRecord : undefined}
            AddForm={(props) => <AddMedicationForm {...props} ref={addMedicationFormRef} />}
            EditForm={EditMedicationWrapper as any}
        />
      </div>
      {activeSynopsis && renderSynopsisDialog()}
    </>
  );
}

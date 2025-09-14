

'use client';

import { Stethoscope, PlusCircle, Loader2, Pill, Info, Trash2, Edit, X, Settings, ShieldAlert, AlertTriangle as AlertTriangleIcon, RefreshCw } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { MedicationSynopsisDialog } from './medication-synopsis-dialog';
import type { MedicalCondition, Medication } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { AddMedicationForm } from './add-medication-dialog';
import { AddMedicalConditionForm } from './add-medical-condition-dialog';
import { ActionIcon } from './ui/action-icon';
import { ActionMenu } from './ui/action-menu';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Alert, AlertDescription } from './ui/alert';
import { produce } from 'immer';
import { EditMedicationForm } from './edit-medication-form';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { v4 as uuidv4 } from 'uuid';
import { UniversalCard } from './universal-card';
import { Separator } from './ui/separator';

type ActiveView = 'none' | `add` | `edit_${string}` | `synopsis_${string}`;


interface MedicalInfoSectionProps<T extends MedicalCondition | Medication> {
  title: string;
  icon: React.ReactNode;
  items: T[];
  type: 'condition' | 'medication';
  onShowSynopsis: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (item: T) => void;
  onAddItem: (item: Omit<T, 'id'>) => void;
  nilRecord?: T;
  AddForm: React.ComponentType<{ onSave: (data: any) => void; onCancel: () => void; initialData?: T }>;
  EditForm?: React.ComponentType<{ onSave: (data: any) => void; onCancel: () => void; initialData: T; }>;
}


function MedicalInfoSection<T extends MedicalCondition | Medication>({ 
    title, icon, items, type, onShowSynopsis, onRemoveItem, onUpdateItem, onAddItem, nilRecord, AddForm, EditForm
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
              disabled={items.length === 0 && !nilRecord}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditingList ? 'Done Editing' : 'Edit List'}
            </DropdownMenuItem>
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
        <UniversalCard
            title={title}
            icon={icon}
            actions={actions}
        >
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
                            form={null}
                            isNilItem={true}
                        />
                    ) : null}
                    {items.length === 0 && !nilRecord && activeView !== 'add' && <p className="text-xs text-muted-foreground pl-8 pt-2">No {type === 'condition' ? 'conditions' : 'medications'} recorded.</p>}
                </ul>
            </>
        </UniversalCard>
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
    onRevise?: (item: any) => void;
    form: React.ReactNode;
    isNilItem?: boolean;
}

function ListItem({ item, type, isEditing, isFormOpen, onRemove, onShowSynopsis, onRevise, form, isNilItem = false }: ListItemProps) {
    const formatDate = useDateFormatter();
    const isMobile = useIsMobile();
    
    const isPending = item.status === 'pending_review';
    const isFailed = item.status === 'failed';

    let title: string;
    let details: string | null = null;
    let originalInput: string | undefined;
    let date: string | undefined;
    let icdCode: string | undefined;

    if (type === 'condition') {
        const cond = item as MedicalCondition;
        title = cond.condition || cond.userInput;
        originalInput = cond.userInput;
        date = cond.date;
        icdCode = cond.icdCode;
    } else {
        const med = item as Medication;
        title = isNilItem ? 'Nil - No medication taken' : isFailed ? med.userInput : med.name;
        originalInput = med.userInput;
        if (!isNilItem && med.status !== 'failed') {
            details = [med.dosage, med.frequency, med.foodInstructions ? `${med.foodInstructions} food` : ''].filter(Boolean).join(', ');
        }
    }
    
    const handleItemClick = () => {
        if (isMobile && !isNilItem && !isFailed && !isPending) {
            onShowSynopsis(item.id);
        }
    }
    
    const showOriginalInput = originalInput && title && originalInput.toLowerCase() !== title.toLowerCase() && !isNilItem && !isFailed;

    const itemBorderColor = isNilItem ? 'border-transparent' : isPending ? "border-yellow-500" : isFailed ? "border-destructive" : "border-primary";
    const itemCursor = (isMobile && !isNilItem) ? "cursor-pointer" : "cursor-default";


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
                <div className="flex-1 min-w-0">
                     <p className="font-semibold text-foreground text-sm truncate" title={title}>{title}</p>
                     
                    {isPending ? (
                        <div className="flex items-center gap-1.5 mt-1">
                            <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
                            <p className="text-yellow-600 text-xs italic">Processing...</p>
                        </div>
                    ) : isFailed ? (
                        <div className="flex items-center gap-1.5 mt-1">
                            <AlertTriangleIcon className="h-3 w-3 text-destructive" />
                            <p className="text-destructive text-xs italic">Processing failed. Click to retry.</p>
                        </div>
                    ) : (
                        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                            {type === 'condition' ? (
                                <>
                                    {showOriginalInput && <p className="truncate">You entered as "{originalInput}"</p>}
                                    {icdCode && <p>ICD-11: {icdCode}</p>}
                                    {date && <p>Diagnosed: {formatDate(date)}</p>}
                                </>
                            ) : (
                                <>
                                    {showOriginalInput && <p className="italic truncate">({originalInput})</p>}
                                    {details && <p className="truncate">{details}</p>}
                                </>
                            )}
                        </div>
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
                    {!isEditing && !isPending && !isNilItem && !isFailed && type === 'medication' && (
                        <ActionIcon 
                            tooltip="View Synopsis"
                            icon={<Info className="h-5 w-5 text-blue-500" />}
                            onClick={(e) => { e.stopPropagation(); onShowSynopsis(item.id); }}
                        />
                    )}
                </div>
            </div>
        </div>
        {isFormOpen && <div className="mt-2">{form}</div>}
        </li>
    );
}


export function MedicalHistoryCard() {
  const { profile, updateMedicalCondition, removeMedication, removeMedicalCondition, addMedicalCondition, addMedication, updateMedication } = useApp();
  const [activeSynopsis, setActiveSynopsis] = React.useState<{ type: 'condition' | 'medication', id: string } | null>(null);

  const handleAddCondition = (data: { userInput: string; date: string }) => {
      const newCondition: Omit<MedicalCondition, 'id'> = {
          userInput: data.userInput,
          condition: data.userInput, // No AI processing, so condition is same as input
          date: data.date,
          status: 'processed',
      };
      addMedicalCondition(newCondition);
      toast({ title: "Condition Saved", description: `${newCondition.condition} has been added to your list.`});
  }
  
  const handleAddMedication = (data: Omit<Medication, 'id'>) => {
    const isNilPresent = profile.medication?.length === 1 && profile.medication[0].id === 'nil';
    if (isNilPresent) {
      removeMedication('nil');
    }
    const newMedication: Omit<Medication, 'id'> = {
        ...data,
        name: data.userInput,
        status: 'processed'
    };
    addMedication(newMedication);
     toast({ title: "Medication Saved", description: `${newMedication.name} has been added to your list.`});
  }

  const renderSynopsisDialog = () => {
    if (!activeSynopsis) return null;
    const { type, id } = activeSynopsis;
    
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

    const EditConditionWrapper = (props: any) => (
        <AddMedicalConditionForm {...props} onSave={({userInput, date}) => {
            updateMedicalCondition({ ...props.initialData, userInput: userInput, condition: userInput, date: date });
            props.onCancel();
        }} />
    );
  
  const handleRemoveNilMedication = () => {
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

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        <MedicalInfoSection
            title="Present Medical Conditions"
            icon={<Stethoscope className="h-5 w-5 shrink-0 text-muted-foreground" />}
            items={profile.presentMedicalConditions || []}
            type="condition"
            onShowSynopsis={() => {}}
            onRemoveItem={removeMedicalCondition}
            onUpdateItem={updateMedicalCondition}
            onAddItem={handleAddCondition as any}
            AddForm={AddMedicalConditionForm as any}
            EditForm={EditConditionWrapper as any}
        />
        <Separator />
        <MedicalInfoSection
            title="Current Medication"
            icon={<Pill className="h-5 w-5 shrink-0 text-muted-foreground" />}
            items={profile.medication || []}
            type="medication"
            onShowSynopsis={(id) => setActiveSynopsis({ type: 'medication', id })}
            onRemoveItem={(id) => {
                if(id === 'nil') {
                    handleRemoveNilMedication();
                } else {
                    removeMedication(id);
                }
            }}
            onUpdateItem={updateMedication}
            onAddItem={handleAddMedication}
            nilRecord={profile.medication?.length === 0 ? nilMedicationRecord : undefined}
            AddForm={({onSave, onCancel}) => <AddMedicationForm onSuccess={onSave} onCancel={onCancel} />}
            EditForm={EditMedicationWrapper as any}
        />
      </div>
      {activeSynopsis && renderSynopsisDialog()}
    </>
  );
}
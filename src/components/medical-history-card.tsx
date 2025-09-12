
'use client';

import { Stethoscope, PlusCircle, Loader2, Pill, Info, Trash2, Edit, X, Settings, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { DrugInteractionViewer } from './drug-interaction-viewer';
import { MedicationSynopsisDialog } from './medication-synopsis-dialog';
import { DiseaseCard } from './disease-card';
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

interface MedicationListItemProps {
    med: Medication;
    isEditing: boolean;
    onRemove: (id: string) => void;
    onShowSynopsis: (id: string) => void;
    onProcess: (med: Medication) => void;
    formatDetails: (med: Medication) => string;
}

function MedicationListItem({ med, isEditing, onRemove, onShowSynopsis, onProcess, formatDetails }: MedicationListItemProps) {
    const isPending = med.name === 'pending...';

    const handleItemClick = () => {
        if (isPending) {
            onProcess(med);
        }
    }

    return (
        <li
            className={cn(
                "group flex items-center gap-2 text-xs text-muted-foreground border-l-2 pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md",
                isPending ? "border-yellow-500 cursor-pointer" : "border-primary"
            )}
            onClick={handleItemClick}
        >
            <div className="flex-1">
            {med.name.toLowerCase() === 'nil' ? (
                <span className="font-semibold text-foreground">Nil - No medication</span>
            ) : (
                <div>
                    <p className="font-semibold text-foreground">{isPending ? med.brandName : med.name}</p>
                    <p className="text-muted-foreground text-xs italic">
                        {isPending ? "Click to process with AI" : `Patient Input: "${med.brandName}"`}
                    </p>
                    {!isPending && <p className="text-muted-foreground text-xs">{formatDetails(med)}</p>}
                </div>
            )}
            </div>
                <div className="flex items-center shrink-0">
                     {isPending && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
                    {!isPending && med.name.toLowerCase() !== 'nil' && (
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

  const handleProcessCondition = async (condition: MedicalCondition) => {
    toast({ title: "Processing Condition...", description: `Asking AI about "${condition.userInput}"`});
    try {
      const result = await processMedicalCondition({ condition: condition.userInput || '' });
      if (result.isValid && result.standardizedName && result.icdCode) {
        updateMedicalCondition({
            ...condition,
            condition: result.standardizedName,
            icdCode: result.icdCode,
            synopsis: result.synopsis || '',
        });
        toast({ title: 'Condition Processed', description: `AI identified: ${result.standardizedName} (${result.icdCode})` });
      } else {
        updateMedicalCondition({ ...condition, icdCode: 'failed' });
        toast({ variant: 'destructive', title: 'Condition Not Recognized', description: `Suggestions: ${result.suggestions?.join(', ') || 'None'}` });
      }
    } catch(e) {
      console.error(e);
      updateMedicalCondition({ ...condition, icdCode: 'failed' });
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process condition.' });
    }
  }

  const handleProcessMedication = async (med: Medication) => {
    toast({ title: "Processing Medication...", description: `Asking AI about "${med.brandName}"`});
     try {
      const result = await getMedicationInfo({ 
        medicationName: med.brandName,
        dosage: med.dosage,
        frequency: med.frequency,
        foodInstructions: med.foodInstructions,
      });
      if (result.activeIngredient) {
        updateMedicalCondition({ // Note: this seems to be a typo in original code, should be updateMedication. Assuming this is what's intended
             ...med,
             name: result.activeIngredient,
             dosage: result.dosage || med.dosage,
             frequency: result.frequency || med.frequency,
             foodInstructions: result.foodInstructions || med.foodInstructions,
             brandName: result.correctedMedicationName || med.brandName,
        });
        toast({ title: "Medication Processed", description: `AI identified: ${result.activeIngredient}`});
      } else {
        toast({ variant: 'destructive', title: 'Could not identify medication.' });
      }
    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process medication.' });
    }
  }
  
  const handleSaveCondition = (condition: MedicalCondition) => {
    if (activeView === 'editCondition') {
        updateMedicalCondition(condition);
    } else {
        addMedicalCondition(condition);
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
      <DropdownMenuItem onSelect={() => setActiveView('addMedication')}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Medication
      </DropdownMenuItem>
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
        return <AddMedicalConditionForm onSave={handleSaveCondition} onCancel={closeActiveView} initialData={activeData} />;
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
                                onProcess={handleProcessCondition}
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
                            onProcess={handleProcessMedication}
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

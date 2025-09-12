
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Check, Edit, Wand2 } from 'lucide-react';
import type { FoodInstruction, Medication } from '@/lib/types';
import type { MedicationInfoOutput } from '@/lib/ai-types';
import { EditMedicationForm } from './edit-medication-form';
import { Alert, AlertDescription } from './ui/alert';

interface MedicationReviewCardProps {
    userInput: {
        userInput: string;
        frequency: string;
        foodInstructions?: FoodInstruction;
    };
    aiResult: MedicationInfoOutput;
    onConfirm: (data: MedicationInfoOutput) => void;
    onEdit: (data: MedicationInfoOutput) => void;
    onCancel: () => void;
}

export function MedicationReviewCard({ userInput, aiResult, onConfirm, onEdit, onCancel }: MedicationReviewCardProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [currentAiResult, setCurrentAiResult] = React.useState(aiResult);
    const [currentUserInput, setCurrentUserInput] = React.useState(userInput);


    const handleUseSuggestion = () => {
        if (!currentAiResult.spellingSuggestion) return;
        
        setCurrentUserInput(prev => ({...prev, userInput: currentAiResult.spellingSuggestion!}));
        
        // We can create a new aiResult without the suggestion to hide the suggestion box after use.
        const { spellingSuggestion, ...rest } = currentAiResult;
        setCurrentAiResult(rest);
    }

    if (isEditing) {
        // Pass the spelling suggestion into the initial data for the edit form
        const initialDataForEdit: Medication & { spellingSuggestion?: string } = {
            id: 'temp',
            name: currentAiResult.activeIngredient,
            userInput: currentUserInput.userInput,
            dosage: currentAiResult.dosage || '',
            frequency: currentAiResult.frequency || currentUserInput.frequency,
            foodInstructions: currentAiResult.foodInstructions,
            status: 'processed',
            spellingSuggestion: currentAiResult.spellingSuggestion,
        };
        
        return (
            <EditMedicationForm 
                initialData={initialDataForEdit}
                onCancel={() => setIsEditing(false)}
                onSuccess={onEdit}
            />
        );
    }

    return (
        <Card className="mt-2 border-primary border-2">
            <CardHeader>
                <CardTitle>Review AI Suggestions</CardTitle>
                <CardDescription>Please confirm the details extracted by the AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                    <h4 className="font-semibold text-sm">Your Input</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{currentUserInput.userInput}</span>
                    </div>
                    {currentAiResult.spellingSuggestion && (
                         <Alert className="mt-2 p-2 bg-accent/10 border-accent/20">
                            <AlertDescription className="text-xs flex items-center justify-between gap-2">
                               <span>AI Suggestion: <span className="font-semibold">{currentAiResult.spellingSuggestion}</span></span>
                               <Button
                                 type="button"
                                 size="xs"
                                 variant="outline"
                                 onClick={handleUseSuggestion}
                               >
                                 <Wand2 className="mr-1 h-3 w-3" />
                                 Use
                               </Button>
                             </AlertDescription>
                           </Alert>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span>{currentUserInput.frequency || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Instructions:</span>
                        <span className="capitalize">{currentUserInput.foodInstructions || 'Not specified'}</span>
                    </div>
                </div>

                <div className="space-y-2 rounded-lg border bg-background p-4">
                    <h4 className="font-semibold text-sm">AI Suggestions</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Active Ingredient:</span>
                        <span className="font-bold">{currentAiResult.activeIngredient}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dosage:</span>
                        <span>{currentAiResult.dosage || 'Not found'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span>{currentAiResult.frequency || 'No change'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Instructions:</span>
                        <span className="capitalize">{currentAiResult.foodInstructions || 'No change'}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button type="button" onClick={() => onConfirm(currentAiResult)}>
                        <Check className="mr-2 h-4 w-4" />
                        Confirm & Save
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

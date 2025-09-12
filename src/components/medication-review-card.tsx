
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Check, Edit } from 'lucide-react';
import type { FoodInstruction } from '@/lib/types';
import type { MedicationInfoOutput } from '@/lib/ai-types';
import { EditMedicationForm } from './edit-medication-form';

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

    if (isEditing) {
        return (
            <EditMedicationForm 
                initialData={{
                    id: 'temp',
                    name: aiResult.activeIngredient,
                    userInput: userInput.userInput,
                    dosage: aiResult.dosage || '',
                    frequency: aiResult.frequency || userInput.frequency,
                    foodInstructions: aiResult.foodInstructions,
                    status: 'processed'
                }}
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
                        <span>{userInput.userInput}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span>{userInput.frequency || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Instructions:</span>
                        <span className="capitalize">{userInput.foodInstructions || 'Not specified'}</span>
                    </div>
                </div>

                <div className="space-y-2 rounded-lg border bg-background p-4">
                    <h4 className="font-semibold text-sm">AI Suggestions</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Active Ingredient:</span>
                        <span className="font-bold">{aiResult.activeIngredient}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dosage:</span>
                        <span>{aiResult.dosage || 'Not found'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span>{aiResult.frequency || 'No change'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Instructions:</span>
                        <span className="capitalize">{aiResult.foodInstructions || 'No change'}</span>
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
                    <Button type="button" onClick={() => onConfirm(aiResult)}>
                        <Check className="mr-2 h-4 w-4" />
                        Confirm & Save
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


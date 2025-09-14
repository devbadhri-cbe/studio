'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Check, Edit, Wand2, AlertTriangle } from 'lucide-react';
import type { MedicalConditionOutput } from '@/lib/ai-types';
import { Alert, AlertDescription } from './ui/alert';

interface ConditionReviewCardProps {
    userInput: string;
    date: string;
    aiResult: MedicalConditionOutput;
    onConfirm: (data: { aiResult: MedicalConditionOutput; userInput: string; date: string }) => void;
    onCancel: () => void;
}

export function ConditionReviewCard({ userInput, date, aiResult, onConfirm, onCancel }: ConditionReviewCardProps) {
    const [currentAiResult, setCurrentAiResult] = React.useState(aiResult);
    const [currentUserInput, setCurrentUserInput] = React.useState(userInput);

    const handleUseSuggestion = () => {
        if (!currentAiResult.suggestion) return;
        
        setCurrentUserInput(currentAiResult.suggestion);
        
        const { suggestion, ...rest } = currentAiResult;
        setCurrentAiResult(rest);
    }
    
    // We don't need an edit form for this, as the AI suggestion is simpler.
    // If the suggestion is wrong, the user can just cancel and re-enter.

    return (
        <Card className="mt-2 border-primary border-2">
            <CardHeader>
                <CardTitle>Review AI Suggestion</CardTitle>
                <CardDescription>Please confirm the condition identified by the AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {currentAiResult.duplicateOf && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This appears to be a duplicate of an existing condition: <strong>{currentAiResult.duplicateOf}</strong>. Saving this will create a redundant entry.
                        </AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                    <h4 className="font-semibold text-sm">Your Input</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">You entered:</span>
                        <span className="font-medium">{currentUserInput}</span>
                    </div>
                     {currentAiResult.suggestion && (
                         <Alert className="mt-2 p-2 bg-accent/10 border-accent/20">
                            <AlertDescription className="text-xs flex items-center justify-between gap-2">
                               <span>AI Suggestion: <span className="font-semibold">{currentAiResult.suggestion}</span></span>
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
                </div>

                <div className="space-y-2 rounded-lg border bg-background p-4">
                    <h4 className="font-semibold text-sm">AI Identified Condition</h4>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Standardized Name:</span>
                        <span className="font-bold">{currentAiResult.standardizedName}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ICD-11 Code:</span>
                        <span>{currentAiResult.icdCode}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={() => onConfirm({ aiResult: currentAiResult, userInput: currentUserInput, date })}>
                        <Check className="mr-2 h-4 w-4" />
                        Confirm & Save
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

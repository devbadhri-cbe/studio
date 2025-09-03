
'use client';

import { Lightbulb, Loader2, X } from 'lucide-react';
import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface BiomarkerSuggestionCardProps {
  suggestions: string[];
  onDismiss: () => void;
}

export function BiomarkerSuggestionCard({ suggestions, onDismiss }: BiomarkerSuggestionCardProps) {
  const { addCustomBiomarker, customBiomarkers } = useApp();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddBiomarker = async (name: string) => {
    setIsAdding(true);
    try {
        if (customBiomarkers.some(b => b.name.toLowerCase() === name.toLowerCase())) {
             toast({
                variant: 'default',
                title: 'Already exists',
                description: `A card for "${name}" is already on the dashboard.`,
            });
        } else {
            await addCustomBiomarker(name);
            toast({
                title: 'Biomarker Added',
                description: `A monitoring card for "${name}" has been added to the dashboard.`,
            });
        }
    } catch (error) {
       console.error("Error adding biomarker:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add the biomarker card.',
        });
    } finally {
        setIsAdding(false);
        onDismiss();
    }
  }

  return (
    <Card className="border-blue-500 bg-blue-500/5">
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <CardTitle className="text-blue-800">AI Biomarker Suggestions</CardTitle>
            <CardDescription className="text-blue-700">
              Based on the patient's conditions, you might consider monitoring these additional biomarkers.
            </CardDescription>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDismiss}>
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
            <Button 
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleAddBiomarker(suggestion)}
                disabled={isAdding}
            >
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '+'}
                {suggestion}
            </Button>
        ))}
      </CardContent>
    </Card>
  );
}

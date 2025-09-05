
'use client';

import { Lightbulb, Loader2 } from 'lucide-react';
import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { suggestNewBiomarkers } from '@/ai/flows/suggest-new-biomarkers';

export function BiomarkerSuggestionCard() {
  const { addCustomBiomarker, customBiomarkers, profile, enabledDashboards } = useApp();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    const fetchSuggestions = async () => {
        const verifiedConditions = profile.presentMedicalConditions
            .filter(c => c.status === 'verified')
            .map(c => c.condition);

        if (verifiedConditions.length === 0) {
            toast({
                variant: 'default',
                title: 'No Verified Conditions',
                description: `There are no verified medical conditions to generate suggestions from. Please approve a condition first.`,
            });
            setSuggestions([]);
            return;
        };

        setIsLoading(true);

        const currentBiomarkers = [
        ...(enabledDashboards || []).map(d => d.replace(/([A-Z])/g, ' $1').trim()),
        ...(customBiomarkers?.map(b => b.name) || [])
        ];
        
        try {
            const result = await suggestNewBiomarkers({ conditions: verifiedConditions, currentBiomarkers });
            setSuggestions(result.suggestions);
            if (result.suggestions.length > 0) {
                toast({
                    title: 'Suggestions Found',
                    description: 'New biomarker suggestions are available below.',
                });
            } else {
                toast({
                    title: 'No New Suggestions',
                    description: 'The patient is already monitoring all relevant biomarkers for their conditions.',
                });
            }
        } catch(error) {
            console.error("Failed to fetch biomarker suggestions", error);
            toast({
                variant: 'destructive',
                title: 'Suggestion Error',
                description: 'Could not fetch biomarker suggestions at this time.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    fetchSuggestions();
  }, [profile.presentMedicalConditions, enabledDashboards, customBiomarkers, toast]);


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
        setSuggestions(current => current.filter(s => s !== name));
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
              Based on verified conditions, suggest additional biomarkers to monitor.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
       <CardContent className="flex flex-wrap gap-2">
        {isLoading ? (
             <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Checking for suggestions...</span>
            </div>
        ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
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
            ))
        ) : (
            <p className="text-sm text-muted-foreground">No new suggestions available at this time.</p>
        )}
    </CardContent>
    </Card>
  );
}

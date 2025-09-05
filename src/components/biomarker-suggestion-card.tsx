
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  
  const verifiedConditions = React.useMemo(() => {
    return profile.presentMedicalConditions
        .filter(c => c.status === 'verified')
        .map(c => c.condition);
  }, [profile.presentMedicalConditions]);

  // Create stable dependencies for the useEffect hook
  const dependencies = JSON.stringify({
      verifiedConditions,
      enabledDashboards,
      customBiomarkers: customBiomarkers?.map(b => b.name),
  });
  
  React.useEffect(() => {
    const fetchSuggestions = async () => {
        const { verifiedConditions, enabledDashboards, customBiomarkers: customBiomarkerNames } = JSON.parse(dependencies);

        if (verifiedConditions.length === 0) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        };

        setIsLoading(true);

        const currentBiomarkers = [
            ...(enabledDashboards || []).map(d => d.replace(/([A-Z])/g, ' $1').trim()),
            ...(customBiomarkerNames || [])
        ];
        
        try {
            const result = await suggestNewBiomarkers({ conditions: verifiedConditions, currentBiomarkers });
            setSuggestions(result.suggestions);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencies, toast]);


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

  if (verifiedConditions.length === 0) {
      return (
          <Card className="border-blue-500 bg-blue-500/5">
              <CardContent className="p-4">
                 <p className="text-sm text-center text-blue-700">No verified conditions to generate suggestions from. Please verify a condition first.</p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="border-blue-500 bg-blue-500/5">
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <CardTitle className="text-blue-800">AI Biomarker Suggestions</CardTitle>
            <CardDescription className="text-blue-700">
              Based on verified conditions, here are additional biomarkers you may want to monitor.
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

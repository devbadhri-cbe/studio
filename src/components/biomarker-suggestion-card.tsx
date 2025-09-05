
'use client';

import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import * as React from 'react';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { getDashboardRecommendations } from '@/ai/flows/get-dashboard-recommendations';

const getDashboardName = (key: string) => {
    switch (key) {
      case 'diabetes': return 'Diabetes Panel';
      case 'lipids': return 'Lipid Panel';
      case 'hypertension': return 'Hypertension Panel';
      case 'thyroid': return 'Thyroid Panel';
      case 'vitaminD': return 'Vitamin D Panel';
      case 'renal': return 'Renal Panel';
      default: return 'Panel';
    }
}


export function BiomarkerSuggestionCard() {
  const { enableDashboard, profile } = useApp();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  
  const verifiedConditions = React.useMemo(() => {
    return profile.presentMedicalConditions
        .filter(c => c.status === 'verified')
        .map(c => ({ condition: c.condition, icdCode: c.icdCode }));
  }, [profile.presentMedicalConditions]);
  
  const fetchSuggestions = React.useCallback(async () => {
    if (verifiedConditions.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Verified Conditions',
            description: 'Please verify at least one medical condition to get AI suggestions.',
        });
        return;
    };

    setIsLoading(true);
    setSuggestion(null);
    
    try {
        // Use the primary condition for the suggestion
        const primaryCondition = verifiedConditions[0];
        const result = await getDashboardRecommendations({ 
            conditionName: primaryCondition.condition,
            icdCode: primaryCondition.icdCode,
        });
        
        if (result.recommendedDashboard !== 'none') {
            setSuggestion(result.recommendedDashboard);
        } else {
             toast({
                title: 'No New Suggestions',
                description: 'The AI did not find a relevant dashboard to suggest for the current conditions.',
            });
        }
    } catch(error) {
        console.error("Failed to fetch dashboard suggestions", error);
        toast({
            variant: 'destructive',
            title: 'Suggestion Error',
            description: 'Could not fetch dashboard suggestions at this time.',
        });
    } finally {
        setIsLoading(false);
    }
  }, [verifiedConditions, toast]);


  const handleEnableDashboard = async (dashboardKey: string) => {
    setIsAdding(true);
    try {
        const result = enableDashboard(dashboardKey);
        if (result.alreadyExists) {
             toast({
                variant: 'default',
                title: 'Dashboard Already Enabled',
                description: `The ${result.name} is already on the patient's view.`,
            });
        } else {
             toast({
                title: 'Dashboard Enabled',
                description: `The ${result.name} has been added to the patient's view.`,
            });
        }
    } catch (error) {
       console.error("Error enabling dashboard:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not add the dashboard.',
        });
    } finally {
        setIsAdding(false);
        setSuggestion(null);
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
            <CardTitle className="text-blue-800">AI Dashboard Suggestions</CardTitle>
            <CardDescription className="text-blue-700">
              Based on verified conditions, AI can suggest a relevant dashboard to enable.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
       <CardContent className="flex flex-col gap-4">
         <Button onClick={fetchSuggestions} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Get Suggestion
         </Button>

        {suggestion && (
            <div className="flex flex-wrap gap-2">
                <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnableDashboard(suggestion)}
                    disabled={isAdding}
                >
                    {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '+'}
                    Enable {getDashboardName(suggestion)}
                </Button>
            </div>
        )}
    </CardContent>
    </Card>
  );
}

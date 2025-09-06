
'use client';

import { useApp } from '@/context/app-context';
import { Lightbulb, Check, X } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { DashboardSuggestion } from '@/lib/types';
import { availableBiomarkerCards, BiomarkerKey } from '@/lib/biomarker-cards';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';


export function DashboardSuggestionCard() {
  const { profile, setProfile, toggleDiseaseBiomarker } = useApp();
  const { toast } = useToast();
  
  const allKnownBiomarkerLabels = React.useMemo(() => {
    return Object.values(availableBiomarkerCards).map(b => b.label.toLowerCase());
  }, []);

  const pendingSuggestions = (profile.dashboardSuggestions || []).filter(s => s.status === 'pending');
  if (pendingSuggestions.length === 0) return null;
  
  const setSuggestionStatus = (suggestionId: string, status: 'dismissed' | 'completed') => {
      const newSuggestions = profile.dashboardSuggestions?.map(s => 
        s.id === suggestionId ? { ...s, status } : s
    ) || [];
    setProfile({ ...profile, dashboardSuggestions: newSuggestions });
  }

  const handleDismiss = (suggestionId: string) => {
    setSuggestionStatus(suggestionId, 'dismissed');
    toast({ title: 'Suggestion Dismissed' });
  };
  
  const handleEnable = (suggestion: DashboardSuggestion) => {
    const biomarkers = suggestion.biomarkers || [];
    const missingBiomarkers = biomarkers.filter(
        b => !allKnownBiomarkerLabels.includes(b.toLowerCase())
    );

    if (missingBiomarkers.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Action Required: Missing Cards',
          description: `The following biomarker cards must be added by a developer before this panel can be enabled: ${missingBiomarkers.join(', ')}.`,
        })
        return;
    }
    
    const panelMap: { [key: string]: { panelKey: string, biomarkers: (BiomarkerKey | string)[] } } = {
        'Diabetes Panel': { panelKey: 'diabetes', biomarkers: ['hba1c', 'glucose'] },
        'Hypertension Panel': { panelKey: 'hypertension', biomarkers: ['bloodPressure', 'weight'] },
        'Lipids Panel': { panelKey: 'lipids', biomarkers: ['totalCholesterol', 'ldl', 'hdl', 'triglycerides']},
    };

    if (panelMap[suggestion.panelName]) {
        const panelInfo = panelMap[suggestion.panelName];
        panelInfo.biomarkers.forEach(biomarkerKey => {
            toggleDiseaseBiomarker(panelInfo.panelKey, biomarkerKey);
        });
        toast({
            title: `${suggestion.panelName} Enabled`,
            description: 'The suggested biomarkers have been enabled on the dashboard.',
        });
    }

    setSuggestionStatus(suggestion.id, 'completed');
  }
  
  const checkMissingBiomarkers = (suggestion: DashboardSuggestion) => {
      const biomarkers = suggestion.biomarkers || [];
      return biomarkers.filter(
          b => !allKnownBiomarkerLabels.includes(b.toLowerCase())
      );
  }

  return (
    <>
    <Card className="border-blue-500 bg-blue-500/5">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Lightbulb className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <CardTitle className="text-blue-800">AI Suggestions</CardTitle>
            <CardDescription className="text-blue-700">
              The AI has recommendations based on the latest patient data.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingSuggestions.map((suggestion, index) => {
          const missingBiomarkers = checkMissingBiomarkers(suggestion);
          const biomarkersToDisplay = suggestion.biomarkers || [];

          return (
            <React.Fragment key={suggestion.id}>
              {index > 0 && <Separator />}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-3 rounded-md bg-background">
                <div className="flex-1 space-y-2">
                  <p className="text-sm">
                    Based on the diagnosis of <span className="font-semibold">{suggestion.basedOnCondition}</span>, the AI recommends enabling the <span className="font-semibold">{suggestion.panelName}</span>.
                  </p>
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-xs text-muted-foreground">Suggested biomarkers for monitoring:</p>
                    <div className="flex flex-wrap gap-2">
                      {biomarkersToDisplay.map((biomarker) => (
                        <Badge key={biomarker} variant="secondary">{biomarker}</Badge>
                      ))}
                    </div>
                  </div>

                  {missingBiomarkers.length > 0 && (
                      <Alert variant="destructive" className="mt-4">
                          <AlertTitle>Action Required: Missing Cards</AlertTitle>
                          <AlertDescription>
                              The following biomarker cards must be added by a developer before this panel can be enabled: {missingBiomarkers.join(', ')}.
                          </AlertDescription>
                      </Alert>
                  )}

                </div>
                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                  <Button size="sm" variant="outline" onClick={() => handleDismiss(suggestion.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                  <Button size="sm" onClick={() => handleEnable(suggestion)} disabled={missingBiomarkers.length > 0}>
                    <Check className="h-4 w-4 mr-2" />
                    Enable
                  </Button>
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </CardContent>
    </Card>
    </>
  );
}

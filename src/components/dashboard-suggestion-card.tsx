
'use client';

import { useApp } from '@/context/app-context';
import { Lightbulb, Check, X, Pencil } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { DashboardSuggestion } from '@/lib/types';
import { availableBiomarkerCards, BiomarkerKey } from '@/lib/biomarker-cards';
import { CreateBiomarkerDialog } from './create-biomarker-dialog';


export function DashboardSuggestionCard() {
  const { profile, setProfile, toggleDiseaseBiomarker, customBiomarkers, addCustomBiomarker } = useApp();
  const { toast } = useToast();
  const [processingSuggestion, setProcessingSuggestion] = React.useState<DashboardSuggestion | null>(null);
  const [missingBiomarkers, setMissingBiomarkers] = React.useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const allKnownBiomarkerLabels = React.useMemo(() => {
    const standard = Object.values(availableBiomarkerCards).map(b => b.label.toLowerCase());
    const custom = (customBiomarkers || []).map(b => b.name.toLowerCase());
    return [...standard, ...custom];
  }, [customBiomarkers]);

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
    setProcessingSuggestion(null);
    setMissingBiomarkers([]);
    toast({ title: 'Suggestion Dismissed' });
  };
  
  const handleEnable = (suggestion: DashboardSuggestion) => {
    // Step 1: Check for missing biomarkers
    const missing = suggestion.biomarkers.filter(
        b => !allKnownBiomarkerLabels.includes(b.toLowerCase())
    );

    if (missing.length > 0) {
        setProcessingSuggestion(suggestion);
        setMissingBiomarkers(missing);
        return;
    }
    
    // Step 2: If no biomarkers are missing, enable the panel
    const panelMap: { [key: string]: { panelKey: string, biomarkers: BiomarkerKey[] } } = {
        'Diabetes Panel': { panelKey: 'diabetes', biomarkers: ['hba1c', 'glucose'] },
        'Hypertension Panel': { panelKey: 'hypertension', biomarkers: ['bloodPressure', 'weight'] },
        'Lipids Panel': { panelKey: 'lipids', biomarkers: ['lipidProfile'] },
    };
    
    const panelInfo = panelMap[suggestion.panelName];

    if (panelInfo) {
        panelInfo.biomarkers.forEach(biomarkerKey => {
            toggleDiseaseBiomarker(panelInfo.panelKey, biomarkerKey);
        });
        
        toast({
            title: `${suggestion.panelName} Enabled`,
            description: 'The panel has been added to the dashboard.',
        });
        setSuggestionStatus(suggestion.id, 'completed');
    } else {
        toast({
            variant: 'destructive',
            title: 'Panel Not Found',
            description: `The system does not recognize the panel "${suggestion.panelName}".`,
        });
    }
  }
  
  const handleCreateBiomarkerSuccess = (newId: string) => {
    // Re-check after creating a new biomarker
    if (processingSuggestion) {
      // Temporarily add new biomarker to check against
      const newBiomarker = profile.customBiomarkers?.find(b => b.id === newId);
      if (newBiomarker) {
        const updatedMissing = missingBiomarkers.filter(b => b.toLowerCase() !== newBiomarker.name.toLowerCase());
        setMissingBiomarkers(updatedMissing);

        if (updatedMissing.length === 0) {
          toast({ title: "All biomarkers ready!", description: "You can now enable the panel."});
          setProcessingSuggestion(null);
        }
      }
    }
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
          const isProcessingThis = processingSuggestion?.id === suggestion.id;
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
                      {suggestion.biomarkers.map((biomarker) => (
                        <Badge key={biomarker} variant="secondary">{biomarker}</Badge>
                      ))}
                    </div>
                  </div>
                  {isProcessingThis && missingBiomarkers.length > 0 && (
                     <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-sm text-yellow-800 space-y-2">
                        <p className="font-semibold">Action Required</p>
                        <p className="text-xs">The following biomarker cards do not exist in the system yet:</p>
                        <ul className="list-disc list-inside text-xs font-medium">
                            {missingBiomarkers.map(b => <li key={b}>{b}</li>)}
                        </ul>
                         <Button size="xs" onClick={() => setIsCreateDialogOpen(true)}>
                             <Pencil className="mr-1 h-3 w-3" />
                            Create Biomarker Card
                         </Button>
                     </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 self-end sm:self-center">
                  <Button size="sm" variant="outline" onClick={() => handleDismiss(suggestion.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                  <Button size="sm" onClick={() => handleEnable(suggestion)} disabled={isProcessingThis && missingBiomarkers.length > 0}>
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
    <CreateBiomarkerDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateBiomarkerSuccess}
    />
    </>
  );
}

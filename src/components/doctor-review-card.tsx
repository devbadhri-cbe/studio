

'use client';

import { useApp } from '@/context/app-context';
import { AlertTriangle, BadgeCheck, XCircle, Code } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

const getDashboardName = (key: string) => {
    switch (key) {
      case 'diabetes': return 'Diabetes Panel';
      case 'lipids': return 'Lipid Panel';
      case 'hypertension': return 'Hypertension Panel';
      case 'thyroid': return 'Thyroid Panel';
      case 'vitaminD': return 'Vitamin D Panel';
      case 'renal': return 'Renal Panel';
      default: return 'Dashboard';
    }
}

export function DoctorReviewCard() {
  const { profile, dashboardSuggestions, approveMedicalCondition, dismissSuggestion } = useApp();

  const pendingConditions = (profile.presentMedicalConditions || []).filter(c => c.status === 'pending_review');
  
  if (pendingConditions.length === 0) return null;

  return (
    <Card className="border-yellow-500 bg-yellow-500/5">
      <CardHeader>
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
          <div>
            <CardTitle className="text-yellow-800">Doctor's Review Needed</CardTitle>
            <CardDescription className="text-yellow-700">
              The patient has added new medical conditions. Please verify them and approve or dismiss any AI-suggested actions.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingConditions.map((condition, index) => {
          const suggestion = (dashboardSuggestions || []).find(s => s.conditionId === condition.id && s.status === 'pending');
          return (
            <React.Fragment key={condition.id}>
              {index > 0 && <Separator />}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-md bg-background">
                <div className="flex-1">
                  <p className="font-semibold">{condition.condition}</p>
                  {condition.icdCode && (
                    <p className="text-sm text-muted-foreground">AI-suggested ICD-11: {condition.icdCode}</p>
                  )}
                  {suggestion ? (
                    <p className="text-sm text-muted-foreground">Suggested Dashboard: <span className="font-medium text-primary">{getDashboardName(suggestion.suggestedDashboard)}</span></p>
                  ) : (
                    condition.requiredBiomarkers && condition.requiredBiomarkers.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-destructive" />
                                <span className="font-medium">Suggested new biomarkers:</span>
                            </div>
                             <p className="pl-5">{condition.requiredBiomarkers.join(', ')}</p>
                        </div>
                    )
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => dismissSuggestion(condition.id, suggestion?.id)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                  <Button size="sm" onClick={() => approveMedicalCondition(condition.id, suggestion?.id)}>
                    <BadgeCheck className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </CardContent>
    </Card>
  );
}

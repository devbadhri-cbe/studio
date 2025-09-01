
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { AlertTriangle, Check, GaugeCircle, GitMerge, Info, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { DashboardSuggestion } from '@/lib/types';


export function DoctorReviewCard() {
  const { profile, approveMedicalCondition, acknowledgeSuggestion } = useApp();
  const formatDate = useDateFormatter();

  const pendingSuggestions = profile.dashboardSuggestions?.filter(s => s.status === 'pending') || [];
  const pendingConditions = profile.presentMedicalConditions.filter(c => c.status === 'pending_review');
  
  if (pendingSuggestions.length === 0 && pendingConditions.length === 0) {
    return null;
  }

  const getDashboardName = (key: string): string => {
      const names: Record<string, string> = {
          'hba1c': 'HbA1c Dashboard',
          'lipids': 'Lipid Dashboard',
          'vitaminD': 'Vitamin D Dashboard',
          'thyroid': 'Thyroid Dashboard',
          'hypertension': 'Hypertension Dashboard'
      };
      return names[key] || 'Dashboard';
  }
  
  return (
    <Card className="border-yellow-500/50 bg-yellow-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
             <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <div>
              <CardTitle className="text-yellow-700">Action Required</CardTitle>
              <CardDescription className="text-yellow-600/80">The patient has added new information that requires your review.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingConditions.map(condition => {
            const suggestion = pendingSuggestions.find(s => s.conditionId === condition.id);
            return (
                <div key={condition.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border bg-background p-3">
                    <div className="flex-1">
                        <p className="font-semibold">{condition.condition}</p>
                        <p className="text-sm text-muted-foreground">Patient added on {formatDate(condition.date)}</p>
                         {suggestion && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-primary">
                                <GitMerge className="h-3 w-3" />
                                <span>Suggested Dashboard: {getDashboardName(suggestion.suggestedDashboard)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => acknowledgeSuggestion(condition.id)}>
                                    <X className="h-4 w-4 mr-2" />
                                    Dismiss
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Dismiss this suggestion without taking action.</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <Button size="sm" onClick={() => approveMedicalCondition(condition.id, suggestion)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Verify condition {suggestion ? 'and enable dashboard' : ''}.</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            )
        })}
      </CardContent>
    </Card>
  );
}

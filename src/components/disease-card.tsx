
'use client';

import type { MedicalCondition } from '@/lib/types';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Info, Trash2, CheckCircle, AlertTriangle, Edit } from 'lucide-react';
import * as React from 'react';
import { useApp } from '@/context/app-context';
import { ConditionSynopsisDialog } from './condition-synopsis-dialog';
import { suggestIcdCode } from '@/ai/flows/suggest-icd-code';
import { useToast } from '@/hooks/use-toast';

interface DiseaseCardProps {
  condition: MedicalCondition;
  onRevise: (id: string) => void;
}

const statusConfig = {
  verified: { icon: CheckCircle, text: 'Verified by doctor', color: 'text-green-500' },
  pending_review: { icon: Info, text: 'Pending doctor review', color: 'text-yellow-500' },
  needs_revision: { icon: AlertTriangle, text: 'Doctor requested revision', color: 'text-destructive' },
};

export function DiseaseCard({ condition, onRevise }: DiseaseCardProps) {
  const [activeSynopsis, setActiveSynopsis] = React.useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = React.useState<string | null>(null);
  const { isDoctorLoggedIn, removeMedicalCondition, updateMedicalCondition } = useApp();
  const { toast } = useToast();
  const formatDate = useDateFormatter();

  const statusInfo = statusConfig[condition.status] || statusConfig.pending_review;
  const Icon = statusInfo.icon;
  const isLoadingSuggestion = isSuggesting === condition.id;

  const handleSynopsisToggle = (id: string) => {
    if (activeSynopsis === id) {
      setActiveSynopsis(null);
    } else {
      setActiveSynopsis(id);
    }
  };

  const handleRemoveCondition = (id: string) => {
    removeMedicalCondition(id);
    if (activeSynopsis === id) {
      setActiveSynopsis(null);
    }
  };

  const handleSuggestIcdCode = async (condition: MedicalCondition) => {
    setIsSuggesting(condition.id);
    try {
      const { icdCode, description } = await suggestIcdCode({ condition: condition.condition });
      const updatedCondition = { ...condition, icdCode: `${icdCode}: ${description}` };
      updateMedicalCondition(updatedCondition);
      toast({
        title: 'ICD-11 Code Suggested',
        description: `Code ${icdCode} has been added to ${condition.condition}.`,
      });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'Could not get an ICD-11 code suggestion at this time.',
      });
    } finally {
      setIsSuggesting(null);
    }
  };

  return (
    <>
      <li className="group flex items-start gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{condition.condition}</p>
            <Tooltip>
              <TooltipTrigger>
                <Icon className={cn('h-3.5 w-3.5', statusInfo.color)} />
              </TooltipTrigger>
              <TooltipContent>{statusInfo.text}</TooltipContent>
            </Tooltip>
          </div>
          {condition.icdCode ? (
            <p className="text-xs text-muted-foreground">ICD-11: {condition.icdCode}</p>
          ) : (
            isDoctorLoggedIn && (
              <Button
                size="xs"
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => handleSuggestIcdCode(condition)}
                disabled={isLoadingSuggestion}
              >
                {isLoadingSuggestion && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Get ICD-11 Suggestion
              </Button>
            )
          )}
          <p className="text-xs text-muted-foreground">{formatDate(condition.date)}</p>
        </div>
        <div className="flex items-center shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveCondition(condition.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
            onClick={() => handleSynopsisToggle(condition.id)}
          >
            <Info className="h-4 w-4 text-blue-500" />
          </Button>
        </div>
      </li>
      {condition.status === 'needs_revision' && !isDoctorLoggedIn && (
        <li className="pl-3 pb-2">
          <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive text-xs p-2">
            <AlertTriangle className="h-4 w-4 !text-destructive" />
            <AlertDescription>
              Your doctor has requested a revision. Please update the condition name.
              <Button size="xs" className="ml-2" onClick={() => onRevise(condition.id)}>
                <Edit className="mr-1 h-3 w-3" />
                Revise & Resubmit
              </Button>
            </AlertDescription>
          </Alert>
        </li>
      )}
      {activeSynopsis === condition.id && (
        <li className="pl-5 pb-2">
          <ConditionSynopsisDialog
            conditionName={condition.condition}
            onClose={() => setActiveSynopsis(null)}
          />
        </li>
      )}
    </>
  );
}

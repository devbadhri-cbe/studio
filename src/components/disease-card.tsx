

'use client';

import type { MedicalCondition } from '@/lib/types';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Info, Trash2, CheckCircle, AlertTriangle, Edit } from 'lucide-react';
import * as React from 'react';
import { ActionIcon } from './ui/action-icon';

interface DiseaseCardProps {
  condition: MedicalCondition;
  onRevise: (condition: MedicalCondition) => void;
  isEditMode: boolean;
  onRemove: (id: string) => void;
  onShowSynopsis: (id: string) => void;
}

const statusConfig = {
  verified: { icon: CheckCircle, text: 'Verified by doctor', color: 'text-green-500' },
  pending_review: { icon: Info, text: 'Pending doctor review', color: 'text-yellow-500' },
  needs_revision: { icon: AlertTriangle, text: 'Doctor requested revision', color: 'text-destructive' },
};

export function DiseaseCard({ condition, onRevise, isEditMode, onRemove, onShowSynopsis }: DiseaseCardProps) {
  const formatDate = useDateFormatter();

  const statusInfo = statusConfig[condition.status] || statusConfig.pending_review;
  const Icon = statusInfo.icon;
  const isIcdLoading = condition.icdCode === 'loading...';
  
  const handleRemoveCondition = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(condition.id);
  };

  const handleToggleSynopsis = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowSynopsis(condition.id);
  };

  return (
    <>
      <li className="group flex flex-col text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
        <div className="flex items-start gap-2 w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{condition.condition}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                      <Icon className={cn('h-3.5 w-3.5', statusInfo.color)} />
                  </TooltipTrigger>
                  <TooltipContent>{statusInfo.text}</TooltipContent>
                </Tooltip>
              </div>
              {condition.userInput && condition.condition && condition.userInput.toLowerCase() !== condition.condition.toLowerCase() && (
                <p className="text-xs text-muted-foreground italic">Patient Input: "{condition.userInput}"</p>
              )}
              {isIcdLoading ? (
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Getting ICD-11 code...</span>
                 </div>
              ) : (
                condition.icdCode && (
                    <p className="text-xs text-muted-foreground">ICD-11: {condition.icdCode}</p>
                )
              )}
              <p className="text-xs text-muted-foreground">{formatDate(condition.date)}</p>
            </div>
            <div className="flex items-center shrink-0 gap-1">
                <ActionIcon 
                    tooltip="View Synopsis"
                    icon={<Info className="h-5 w-5 text-blue-500" />}
                    onClick={handleToggleSynopsis}
                />
                
                {isEditMode && (
                    <ActionIcon 
                        tooltip="Delete Condition"
                        icon={<Trash2 className="h-5 w-5 text-destructive" />}
                        onClick={handleRemoveCondition}
                    />
                )}
            </div>
        </div>
         {condition.status === 'needs_revision' && (
            <div className="mt-2 w-full">
              <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive text-xs p-2">
                <AlertTriangle className="h-4 w-4 !text-destructive" />
                <AlertDescription className="flex items-center justify-between">
                  Your doctor has requested a revision.
                  <Button size="xs" className="ml-2" onClick={() => onRevise(condition)}>
                    <Edit className="mr-1 h-3 w-3" />
                    Revise
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
      </li>
    </>
  );
}

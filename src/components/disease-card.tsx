
'use client';

import type { MedicalCondition } from '@/lib/types';
import { Button } from './ui/button';
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
  onProcess: (condition: MedicalCondition) => void;
}

const statusConfig = {
  verified: { icon: CheckCircle, text: 'Verified by doctor', color: 'text-green-500' },
  pending_review: { icon: Info, text: 'Pending doctor review', color: 'text-yellow-500' },
  needs_revision: { icon: AlertTriangle, text: 'Doctor requested revision', color: 'text-destructive' },
};

export function DiseaseCard({ condition, onRevise, isEditMode, onRemove, onShowSynopsis, onProcess }: DiseaseCardProps) {
  const formatDate = useDateFormatter();

  const isIcdLoading = condition.icdCode === 'loading...';
  
  const handleRemoveCondition = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(condition.id);
  };

  const handleToggleSynopsis = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowSynopsis(condition.id);
  };
  
  const handleCardClick = () => {
    if (isIcdLoading) {
      onProcess(condition);
    }
  }

  return (
    <>
      <li 
        className={cn(
            "group flex flex-col text-xs text-muted-foreground border-l-2 pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md",
            isIcdLoading ? "border-yellow-500 cursor-pointer" : "border-primary"
        )}
        onClick={handleCardClick}
       >
        <div className="flex items-start gap-2 w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{condition.condition}</p>
              </div>
              {isIcdLoading ? (
                 <div className="flex items-center gap-2 text-xs text-yellow-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Click to process with AI...</span>
                 </div>
              ) : (
                condition.icdCode && condition.icdCode !== 'failed' && (
                    <p className="text-xs text-muted-foreground">ICD-11: {condition.icdCode}</p>
                )
              )}
              <p className="text-xs text-muted-foreground">{formatDate(condition.date)}</p>
            </div>
            <div className="flex items-center shrink-0 gap-1">
                {!isIcdLoading && (
                    <ActionIcon 
                        tooltip="View Synopsis"
                        icon={<Info className="h-5 w-5 text-blue-500" />}
                        onClick={handleToggleSynopsis}
                    />
                )}
                
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
                  Doctor requested revision.
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

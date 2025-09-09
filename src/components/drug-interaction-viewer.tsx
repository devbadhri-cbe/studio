
'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { SynopsisCardLayout } from './synopsis-card-layout';
import { checkDrugInteractions } from '@/ai/flows/drug-interaction-flow';

interface DrugInteractionViewerProps {
  medications: string[];
  onClose: () => void;
}

export function DrugInteractionViewer({ medications, onClose }: DrugInteractionViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleInteractionCheck = React.useCallback(async () => {
    if (medications.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Not enough medications',
        description: 'Please add at least two medications to check for interactions.',
      });
      onClose();
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
        const response = await checkDrugInteractions({ medications });
        if (response.summary) {
            setResult(response.summary);
        } else {
            setError('The AI could not determine if there were any interactions. Please consult your doctor.');
        }
    } catch (e) {
        console.error("Interaction check failed", e);
        setError('An error occurred. Could not analyze interactions.');
    } finally {
        setIsLoading(false);
    }
    
  }, [medications, toast, onClose]);

  React.useEffect(() => {
    handleInteractionCheck();
  }, [handleInteractionCheck]);


  return (
    <SynopsisCardLayout
        variant="destructive"
        icon={<ShieldAlert className="h-6 w-6 text-destructive" />}
        title="Interaction Summary"
        description="AI-generated drug interaction analysis"
        isLoading={isLoading}
        error={error}
        synopsis={result}
        footer={<></>}
        onClose={onClose}
    />
  );
}

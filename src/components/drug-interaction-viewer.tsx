
'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent } from './ui/card';
import { checkDrugInteractions } from '@/ai/flows/drug-interaction-flow';

interface DrugInteractionViewerProps {
  medications: string[];
  onClose: () => void;
}

export function DrugInteractionViewer({ medications, onClose }: DrugInteractionViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [result, setResult] = React.useState<string | null>(null);
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
    setResult(null);
    try {
        const response = await checkDrugInteractions({ medications });
        if (response.summary) {
            setResult(response.summary);
        } else {
            setResult('The AI could not determine if there were any interactions. Please consult your doctor.');
        }
    } catch (e) {
        console.error("Interaction check failed", e);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not perform interaction analysis at this time.',
        });
        setResult('An error occurred. Could not analyze interactions.');
    } finally {
        setIsLoading(false);
    }
    
  }, [medications, toast, onClose]);

  React.useEffect(() => {
    handleInteractionCheck();
  }, [handleInteractionCheck]);


  return (
    <Card className="mt-2">
      <CardContent className="p-4 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Analyzing interactions...</p>
          </div>
        )}
        {result && (
            <div className="space-y-4">
                  <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                    <ShieldAlert className="h-4 w-4 !text-destructive" />
                    <AlertTitle className="text-destructive">Interaction Summary</AlertTitle>
                    <AlertDescription className="text-destructive/90 whitespace-pre-wrap">
                      {result}
                    </AlertDescription>
                  </Alert>
            </div>
        )}
         <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
          Close
        </Button>
      </CardContent>
    </Card>
  );
}

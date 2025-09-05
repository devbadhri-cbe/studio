
'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent } from './ui/card';

interface DrugInteractionViewerProps {
  medications: string[];
  onClose: () => void;
}

export function DrugInteractionViewer({ medications, onClose }: DrugInteractionViewerProps) {
  const [isLoading, setIsLoading] = React.useState(false);
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
    // Placeholder for AI check
    setTimeout(() => {
        setResult('AI-powered drug interaction checks are temporarily disabled.');
        setIsLoading(false);
    }, 1000);
    
  }, [medications, toast, onClose]);

  return (
    <Card className="mt-2">
      <CardContent className="p-4 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Analyzing interactions...</p>
          </div>
        )}
        {!result && !isLoading && (
            <Button onClick={handleInteractionCheck} className="w-full">
                Analyze Interactions
            </Button>
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

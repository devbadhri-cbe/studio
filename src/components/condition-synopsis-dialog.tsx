
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, BookOpen, XCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useApp } from '@/context/app-context';
import { getConditionSynopsis } from '@/ai/flows/get-condition-synopsis-flow';

interface ConditionSynopsisProps {
  conditionName: string;
  onClose: () => void;
}

export function ConditionSynopsisDialog({ conditionName, onClose }: ConditionSynopsisProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [result, setResult] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { isDoctorLoggedIn } = useApp();

  React.useEffect(() => {
    const fetchSynopsis = async () => {
        if (!conditionName) return;

        setIsLoading(true);
        setResult(null);
        
        try {
            const audience = isDoctorLoggedIn ? 'doctor' : 'patient';
            const response = await getConditionSynopsis({ conditionName, audience });
            setResult(response.synopsis);
        } catch (error) {
            console.error('Failed to get synopsis:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load the synopsis for this condition.',
            });
            setResult('Failed to load synopsis. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchSynopsis();
  }, [conditionName, isDoctorLoggedIn, toast]);

  return (
    <Card className="mt-2 bg-muted/30">
        <CardContent className="p-4 space-y-4">
             {isLoading && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Loading synopsis...</p>
                </div>
            )}
             {result && !isLoading && (
                <div className="space-y-4">
                    <Alert>
                    <BookOpen className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Condition Information</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap leading-relaxed text-xs">
                        {result}
                    </AlertDescription>
                    </Alert>
                </div>
            )}
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onClose}>
                <XCircle className="mr-2 h-4 w-4" />
                Close
            </Button>
        </CardContent>
    </Card>
  );
}

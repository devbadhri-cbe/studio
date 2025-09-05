
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, BookOpen, XCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface ConditionSynopsisProps {
  conditionName: string;
  onClose: () => void;
}

export function ConditionSynopsisDialog({ conditionName, onClose }: ConditionSynopsisProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFetchSynopsis = React.useCallback(async () => {
    if (!conditionName) return;

    setIsLoading(true);
    setResult(null);
    // Placeholder for fetching synopsis - can be re-implemented later
    setTimeout(() => {
        setResult(`Synopsis for ${conditionName} would be shown here.`);
        setIsLoading(false);
    }, 1000);
  }, [conditionName, toast, onClose]);

  return (
    <Card className="mt-2 bg-muted/30">
        <CardContent className="p-4 space-y-4">
             {isLoading && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Loading synopsis...</p>
                </div>
            )}
            {!result && !isLoading && (
                <Button onClick={handleFetchSynopsis} className="w-full">
                    Load Synopsis for {conditionName}
                </Button>
            )}
             {result && (
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

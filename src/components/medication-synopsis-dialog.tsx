
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getMedicationSynopsis } from '@/ai/flows/medication-synopsis';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, BookOpen } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface MedicationSynopsisDialogProps {
  medicationName: string;
  children: React.ReactNode;
}

export function MedicationSynopsisDialog({ medicationName, children }: MedicationSynopsisDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFetchSynopsis = React.useCallback(async () => {
    if (!medicationName) return;

    setIsLoading(true);
    setResult(null);
    try {
      const response = await getMedicationSynopsis({ medicationName });
      setResult(response.synopsis);
    } catch (error) {
      console.error('Error fetching medication synopsis:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not fetch medication information.',
      });
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [medicationName, toast]);
  
  React.useEffect(() => {
    if(open) {
        handleFetchSynopsis();
    }
  }, [open, handleFetchSynopsis]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Synopsis for {medicationName}</DialogTitle>
          <DialogDescription>
            AI-generated summary. Always consult a healthcare professional.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <div className="py-4 space-y-4">
            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading synopsis...</p>
                </div>
            )}
            {result && (
                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Medication Information</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap leading-relaxed">
                    {result}
                  </AlertDescription>
                </Alert>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

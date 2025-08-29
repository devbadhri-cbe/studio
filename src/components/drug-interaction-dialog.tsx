

'use client';

import { checkDrugInteractions } from '@/ai/flows/drug-interaction-check';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';

interface DrugInteractionDialogProps {
  medications: string[];
  disabled?: boolean;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function DrugInteractionDialog({ medications, disabled, children, onOpenChange }: DrugInteractionDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleInteractionCheck = async () => {
    if (medications.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Not enough medications',
        description: 'Please add at least two medications to check for interactions.',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await checkDrugInteractions({ medications });
      setResult(response.interactionSummary);
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not perform the drug interaction check.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if(onOpenChange) {
        onOpenChange(newOpen);
    }
    
    if (newOpen) {
      handleInteractionCheck();
    } else {
        // Reset on close
        setResult(null);
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Drug Interaction Analysis</DialogTitle>
          <DialogDescription>
            AI-powered analysis of potential interactions for the current medication list.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <div className="py-4 space-y-4">
            {isLoading && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Analyzing interactions...</p>
                </div>
            )}
            {result && (
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                    <ShieldAlert className="h-4 w-4 !text-destructive" />
                    <AlertTitle className="text-destructive">Interaction Summary</AlertTitle>
                    <AlertDescription className="text-destructive/90 whitespace-pre-wrap">
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

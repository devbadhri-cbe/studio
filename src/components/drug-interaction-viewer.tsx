
'use client';

import { checkDrugInteractions } from '@/ai/flows/drug-interaction-check';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, Languages, Undo2 } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { translateText } from '@/ai/flows/translate-text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from './ui/card';

interface DrugInteractionViewerProps {
  medications: string[];
  onClose: () => void;
}

const LANGUAGES = [
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Mandarin', label: 'Mandarin' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Japanese', label: 'Japanese' },
];

export function DrugInteractionViewer({ medications, onClose }: DrugInteractionViewerProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [originalText, setOriginalText] = React.useState<string | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [targetLanguage, setTargetLanguage] = React.useState('');
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
    setOriginalText(null);
    setTargetLanguage('');
    try {
      const response = await checkDrugInteractions({ medications });
      setResult(response.interactionSummary);
      setOriginalText(response.interactionSummary);
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not perform the drug interaction check.',
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [medications, toast, onClose]);

  React.useEffect(() => {
    handleInteractionCheck();
  }, [handleInteractionCheck]);

  const handleTranslate = async () => {
    if (!result || !targetLanguage) return;

    setIsTranslating(true);
    try {
        const response = await translateText({ text: originalText!, targetLanguage });
        setResult(response.translatedText);
    } catch (error) {
         console.error('Error translating text:', error);
         toast({
            variant: 'destructive',
            title: 'Translation Failed',
            description: `Could not translate the text to ${targetLanguage}.`,
         });
    } finally {
        setIsTranslating(false);
    }
  }

  const handleRevert = () => {
      setResult(originalText);
  }

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
                <div className="flex items-center gap-2">
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Translate..." />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleTranslate} disabled={isTranslating || !targetLanguage} size="icon" variant="outline">
                        {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                    </Button>
                    {result !== originalText && (
                        <Button onClick={handleRevert} size="icon" variant="outline">
                            <Undo2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
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

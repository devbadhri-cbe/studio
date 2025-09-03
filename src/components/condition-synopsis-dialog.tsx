
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { getConditionSynopsis } from '@/ai/flows/condition-synopsis';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, BookOpen, Languages, Undo2, XCircle } from 'lucide-react';
import { translateText } from '@/ai/flows/translate-text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from './ui/card';

interface ConditionSynopsisProps {
  conditionName: string;
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
    { value: 'Malayalam', label: 'Malayalam' },
];

export function ConditionSynopsisDialog({ conditionName, onClose }: ConditionSynopsisProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [originalText, setOriginalText] = React.useState<string | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [targetLanguage, setTargetLanguage] = React.useState('');
  const { toast } = useToast();

  const handleFetchSynopsis = React.useCallback(async () => {
    if (!conditionName) return;

    setIsLoading(true);
    setResult(null);
    setOriginalText(null);
    setTargetLanguage('');
    try {
      const response = await getConditionSynopsis({ conditionName });
      setResult(response.synopsis);
      setOriginalText(response.synopsis);
    } catch (error) {
      console.error('Error fetching condition synopsis:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not fetch condition information.',
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [conditionName, toast, onClose]);
  
  React.useEffect(() => {
    handleFetchSynopsis();
  }, [handleFetchSynopsis]);

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
    <Card className="mt-2 bg-muted/30">
        <CardContent className="p-4 space-y-4">
             {isLoading && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Loading synopsis...</p>
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

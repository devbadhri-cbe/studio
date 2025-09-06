
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, BookOpen, XCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { getMedicationSynopsis } from '@/ai/flows/get-medication-synopsis-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { translateText } from '@/ai/flows/translate-text-flow';

const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'zh', name: 'Chinese' },
];

interface MedicationSynopsisProps {
  medicationName: string;
  onClose: () => void;
}

export function MedicationSynopsisDialog({ medicationName, onClose }: MedicationSynopsisProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [originalSynopsis, setOriginalSynopsis] = React.useState<string | null>(null);
  const [translatedSynopsis, setTranslatedSynopsis] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const { toast } = useToast();

  const handleFetchSynopsis = React.useCallback(async () => {
    if (!medicationName) return;

    setIsLoading(true);
    setOriginalSynopsis(null);
    setTranslatedSynopsis(null);
    setSelectedLanguage('en');

    try {
      const response = await getMedicationSynopsis({ medicationName });
      setOriginalSynopsis(response.synopsis);
    } catch (error) {
      console.error("Failed to fetch medication synopsis:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load the synopsis for this medication.',
      });
      setOriginalSynopsis('Failed to load synopsis. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [medicationName, toast]);

  const handleTranslate = async (languageCode: string) => {
    if (languageCode === 'en' || !originalSynopsis) {
        setTranslatedSynopsis(null);
        setSelectedLanguage('en');
        return;
    }
    
    setIsTranslating(true);
    setSelectedLanguage(languageCode);

    try {
        const languageName = supportedLanguages.find(l => l.code === languageCode)?.name || languageCode;
        const response = await translateText({ texts: [originalSynopsis], targetLanguage: languageName });
        setTranslatedSynopsis(response.translatedTexts[0]);
        toast({
            title: 'Translation Complete',
            description: `Synopsis translated to ${languageName}.`,
        });
    } catch (error) {
        console.error("Translation failed:", error);
        toast({
            variant: 'destructive',
            title: 'Translation Error',
            description: 'Could not translate the synopsis.',
        });
        setTranslatedSynopsis(null);
        setSelectedLanguage('en');
    } finally {
        setIsTranslating(false);
    }
  };

  const synopsisToDisplay = translatedSynopsis || originalSynopsis;

  return (
    <Card className="mt-2 bg-muted/30">
        <CardContent className="p-4 space-y-4">
             {(isLoading || isTranslating) && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>{isTranslating ? 'Translating...' : 'Loading synopsis...'}</p>
                </div>
            )}
            {!synopsisToDisplay && !isLoading && !isTranslating && (
                <Button onClick={handleFetchSynopsis} className="w-full">
                    Load Synopsis for {medicationName}
                </Button>
            )}
             {synopsisToDisplay && !isLoading && !isTranslating && (
                <div className="space-y-4">
                    <Alert>
                        <BookOpen className="h-4 w-4" />
                        <AlertTitle className="font-semibold flex justify-between items-center">
                           <span>Medication Information</span>
                            {originalSynopsis && (
                                <Select value={selectedLanguage} onValueChange={handleTranslate} disabled={isTranslating}>
                                    <SelectTrigger className="w-[120px] h-7 text-xs">
                                        <SelectValue placeholder="Translate..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supportedLanguages.map((lang) => (
                                            <SelectItem key={lang.code} value={lang.code} className="text-xs">
                                                {lang.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                           )}
                        </AlertTitle>
                        <AlertDescription className="whitespace-pre-wrap leading-relaxed text-xs pt-2">
                            {synopsisToDisplay}
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

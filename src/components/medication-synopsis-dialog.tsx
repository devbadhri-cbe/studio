
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, BookOpen, XCircle, Pill } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { getMedicationSynopsis } from '@/ai/flows/get-medication-synopsis-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { translateText } from '@/ai/flows/translate-text-flow';
import { Separator } from './ui/separator';

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
  const [isLoading, setIsLoading] = React.useState(true);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [originalSynopsis, setOriginalSynopsis] = React.useState<string | null>(null);
  const [translatedSynopsis, setTranslatedSynopsis] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const { toast } = useToast();

  React.useEffect(() => {
    const handleFetchSynopsis = async () => {
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
    };
    handleFetchSynopsis();
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
    <Card className="mt-2 shadow-none border-0 bg-transparent">
        <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Medication Information</CardTitle>
                <CardDescription>
                  AI-generated summary for {medicationName}
                </CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
             <Separator className="mb-6"/>
             {(isLoading || isTranslating) && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>{isTranslating ? 'Translating...' : 'Loading synopsis...'}</p>
                </div>
            )}
             {synopsisToDisplay && !isLoading && !isTranslating && (
                <div className="space-y-4">
                    <Alert className="bg-muted/50">
                        <AlertDescription className="whitespace-pre-wrap leading-relaxed">
                            {synopsisToDisplay}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            <div className="flex justify-between items-center gap-2 pt-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onClose}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Close
                </Button>
                {originalSynopsis && (
                    <Select value={selectedLanguage} onValueChange={handleTranslate} disabled={isTranslating}>
                        <SelectTrigger className="w-[150px] h-9 text-sm">
                            <SelectValue placeholder="Translate..." />
                        </SelectTrigger>
                        <SelectContent>
                            {supportedLanguages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code} className="text-sm">
                                    {lang.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </CardContent>
    </Card>
  );
}

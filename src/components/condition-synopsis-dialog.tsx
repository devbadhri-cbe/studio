
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, BookOpen, XCircle, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useApp } from '@/context/app-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { getConditionSynopsis } from '@/ai/flows/condition-synopsis-flow';
import type { ConditionSynopsisOutput } from '@/lib/ai-types';
import { toast } from '@/hooks/use-toast';

const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'zh', name: 'Chinese' },
];

interface ConditionSynopsisProps {
  conditionName: string;
  initialSynopsis?: string;
  onClose: () => void;
}

export function ConditionSynopsisDialog({ conditionName, initialSynopsis, onClose }: ConditionSynopsisProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [synopsis, setSynopsis] = React.useState<string | undefined>(initialSynopsis);
  const [originalSynopsis, setOriginalSynopsis] = React.useState<string | undefined>(initialSynopsis);
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const [error, setError] = React.useState<string | null>(null);

  const fetchSynopsis = React.useCallback(async (language: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getConditionSynopsis({
          conditionName,
          language,
        });
        if (result.synopsis) {
          setSynopsis(result.synopsis);
          setOriginalSynopsis(result.synopsis);
        } else {
          throw new Error("No synopsis returned from AI.");
        }
      } catch (e) {
        console.error("Synopsis fetch failed", e);
        setError("Failed to load the synopsis. Please try again.");
        toast({ variant: 'destructive', title: 'Error Loading Synopsis' });
      } finally {
        setIsLoading(false);
      }
  }, [conditionName]);
  
  React.useEffect(() => {
    if (!initialSynopsis) {
      fetchSynopsis('English');
    }
  }, [initialSynopsis, fetchSynopsis]);

  const handleLanguageChange = async (languageCode: string) => {
    if (!languageCode) return;
    setSelectedLanguage(languageCode);
    
    if (languageCode === 'en' && originalSynopsis) {
        setSynopsis(originalSynopsis);
        return;
    }
    
    setIsTranslating(true);
    setError(null);
    try {
        const result = await getConditionSynopsis({
            conditionName,
            language: supportedLanguages.find(l => l.code === languageCode)?.name || 'English'
        });
        if (result.synopsis) {
            setSynopsis(result.synopsis);
        } else {
            throw new Error("No synopsis returned from AI.");
        }
    } catch (e) {
        console.error("Translation failed", e);
        setError("Failed to translate the synopsis. Please try again.");
        toast({ variant: 'destructive', title: 'Translation Error' });
    } finally {
        setIsTranslating(false);
    }
  }


  return (
    <Card className="mt-2 shadow-none border-0 bg-transparent">
        <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Condition Information</CardTitle>
                <CardDescription>
                  AI-generated summary for {conditionName}
                </CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
             <Separator className="mb-6"/>
             {(isLoading || isTranslating) && (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>{isTranslating ? 'Translating...' : 'Loading...'}</p>
                </div>
            )}
            
            {!isLoading && !isTranslating && (
                 <Alert className="bg-muted/50">
                    <AlertDescription className="whitespace-pre-wrap leading-relaxed">
                        {error || synopsis}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex justify-between items-center gap-2 pt-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onClose}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Close
                </Button>
                <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isLoading || isTranslating || !!error}>
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
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

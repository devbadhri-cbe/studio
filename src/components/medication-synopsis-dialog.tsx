
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, BookOpen, XCircle, Pill } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [originalSynopsis, setOriginalSynopsis] = React.useState<string | null>(null);
  const [translatedSynopsis, setTranslatedSynopsis] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');

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
            <Alert className="bg-muted/50">
                <AlertDescription className="whitespace-pre-wrap leading-relaxed">
                    AI features are temporarily disabled.
                </AlertDescription>
            </Alert>
            <div className="flex justify-between items-center gap-2 pt-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onClose}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Close
                </Button>
                {originalSynopsis && (
                    <Select value={selectedLanguage} disabled={true}>
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

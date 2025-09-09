
'use client';

import * as React from 'react';
import { Languages, Pill } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SynopsisCardLayout } from './synopsis-card-layout';
import { toast } from '@/hooks/use-toast';
import { getMedicationSynopsis } from '@/ai/flows/medication-synopsis-flow';

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
  const [error, setError] = React.useState<string | null>(null);

  const synopsisToDisplay = translatedSynopsis || originalSynopsis;

  const fetchSynopsis = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMedicationSynopsis({
        medicationName,
        language: 'English',
      });
      if (result.synopsis) {
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
  }, [medicationName]);

  React.useEffect(() => {
    fetchSynopsis();
  }, [fetchSynopsis]);

  const handleLanguageChange = async (languageCode: string) => {
    if (!languageCode || !originalSynopsis) return;
    
    setSelectedLanguage(languageCode);
    
    if (languageCode === 'en') {
        setTranslatedSynopsis(null);
        return;
    }
    
    setIsTranslating(true);
    setError(null);
    try {
        const result = await getMedicationSynopsis({
            medicationName,
            language: supportedLanguages.find(l => l.code === languageCode)?.name || 'English'
        });
        if (result.synopsis) {
            setTranslatedSynopsis(result.synopsis);
        } else {
            throw new Error("No translated synopsis returned from AI.");
        }
    } catch (e) {
        console.error("Translation failed", e);
        setError("Failed to translate the synopsis. Please try again.");
        toast({ variant: 'destructive', title: 'Translation Error' });
    } finally {
        setIsTranslating(false);
    }
  }


  const footerContent = (
     <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isLoading || isTranslating || !!error || !originalSynopsis}>
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
  );

  return (
    <SynopsisCardLayout
        icon={<Pill className="h-6 w-6 text-primary" />}
        title="Medication Information"
        description={`AI-generated summary for ${medicationName}`}
        isLoading={isLoading}
        isTranslating={isTranslating}
        error={error}
        synopsis={synopsisToDisplay}
        footer={footerContent}
        onClose={onClose}
    />
  );
}

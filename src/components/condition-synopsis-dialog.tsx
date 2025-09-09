'use client';

import * as React from 'react';
import { BookOpen, Languages } from 'lucide-react';
import { getConditionSynopsis } from '@/ai/flows/condition-synopsis-flow';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SynopsisCardLayout } from './synopsis-card-layout';

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
  const [synopsis, setSynopsis] = React.useState<string | null>(initialSynopsis || null);
  const [originalSynopsis, setOriginalSynopsis] = React.useState<string | null>(initialSynopsis || null);
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

  const footerContent = (
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
  );

  return (
    <SynopsisCardLayout
        icon={<BookOpen className="h-6 w-6 text-primary" />}
        title="Condition Information"
        description={`AI-generated summary for ${conditionName}`}
        isLoading={isLoading}
        isTranslating={isTranslating}
        error={error}
        synopsis={synopsis}
        footer={footerContent}
        onClose={onClose}
    />
  );
}

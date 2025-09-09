
'use client';

import { useToast } from '@/hooks/use-toast';
import { Languages, ShieldAlert } from 'lucide-react';
import * as React from 'react';
import { SynopsisCardLayout } from './synopsis-card-layout';
import { checkDrugInteractions } from '@/ai/flows/drug-interaction-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'zh', name: 'Chinese' },
];

interface DrugInteractionViewerProps {
  medications: string[];
  onClose: () => void;
}

export function DrugInteractionViewer({ medications, onClose }: DrugInteractionViewerProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const fetchInteractionSummary = React.useCallback(async (language: string, isTranslation: boolean) => {
    if (medications.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Not enough medications',
        description: 'Please add at least two medications to check for interactions.',
      });
      onClose();
      return;
    }

    if (isTranslation) {
      setIsTranslating(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
        const response = await checkDrugInteractions({ 
            medications, 
            language: supportedLanguages.find(l => l.code === language)?.name || 'English'
        });
        if (response.summary) {
           setSummary(response.summary);
        } else {
            const errorMessage = 'The AI could not determine if there were any interactions. Please consult your doctor.';
            setError(errorMessage);
            setSummary(errorMessage);
        }
    } catch (e) {
        console.error("Interaction check failed", e);
        const errorMessage = 'An error occurred. Could not analyze interactions.';
        setError(errorMessage);
        setSummary(errorMessage);
    } finally {
        setIsLoading(false);
        setIsTranslating(false);
    }
    
  }, [medications, toast, onClose]);

  React.useEffect(() => {
    // Only fetch on initial mount
    fetchInteractionSummary('en', false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleLanguageChange = (languageCode: string) => {
    if (!languageCode || languageCode === selectedLanguage) return;
    setSelectedLanguage(languageCode);
    fetchInteractionSummary(languageCode, true);
  };

  const footerContent = (
     <div className="flex items-center gap-2">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isLoading || isTranslating || !!error || !summary}>
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
        variant="destructive"
        icon={<ShieldAlert className="h-6 w-6 text-destructive" />}
        title="Interaction Summary"
        description="AI-generated drug interaction analysis"
        isLoading={isLoading}
        isTranslating={isTranslating}
        error={error}
        synopsis={summary}
        footer={footerContent}
        onClose={onClose}
    />
  );
}

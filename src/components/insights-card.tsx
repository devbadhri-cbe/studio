
'use client';

import { Lightbulb, Loader2, Languages, RotateCw } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useApp } from '@/context/app-context';
import { UniversalCard } from './universal-card';
import { formatDistanceToNow } from 'date-fns';

const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'zh', name: 'Chinese' },
];

export function InsightsCard() {
  const { 
    profile,
    hba1cRecords,
    fastingBloodGlucoseRecords,
    weightRecords,
    bloodPressureRecords,
    tips,
    isGeneratingInsights,
    isTranslatingInsights,
    insightsError,
    regenerateInsights,
    translateInsights,
    selectedInsightsLanguage,
    setSelectedInsightsLanguage,
  } = useApp();
  
  const handleLanguageChange = async (languageCode: string) => {
    if (!languageCode) return;
    setSelectedInsightsLanguage(languageCode);
    await translateInsights(languageCode);
  }
  
  const hasNoRecords = [
    hba1cRecords || [],
    fastingBloodGlucoseRecords || [],
    weightRecords || [],
    bloodPressureRecords || [],
  ].every(records => records.length === 0);

  const isButtonDisabled = isGeneratingInsights || isTranslatingInsights || hasNoRecords || !profile?.name || !profile?.dob;

  const timestamp = profile?.dashboardSuggestionsTimestamp;

  return (
    <UniversalCard
      icon={<Lightbulb className="h-6 w-6 text-primary" />}
      title="AI-Powered Insights"
      description="Personalized tips to help you manage your overall health."
    >
      <div className="flex-1 flex flex-col items-center justify-center">
            {(isGeneratingInsights || isTranslatingInsights) && (
                <div className="flex justify-center items-center flex-1">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">{isTranslatingInsights ? 'Translating...' : 'Generating...'}</p>
                </div>
            )}
            
            {!isGeneratingInsights && !isTranslatingInsights && (
                <>
                    {tips.length > 0 ? (
                        <div className="w-full">
                            <ul className="space-y-3 text-sm list-disc pl-5 self-start">
                                {tips.map((tip, index) => <li key={index}>{tip}</li>)}
                            </ul>
                            {timestamp && (
                                <p className="text-xs text-muted-foreground mt-4 text-right">
                                    Last generated: {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                                </p>
                            )}
                            {insightsError && (
                                <Alert variant="destructive" className="bg-destructive/5 text-center mt-4">
                                    <AlertDescription>
                                        Could not generate new insights at this time. Showing last available suggestions.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    ) : insightsError ? (
                         <Alert variant="destructive" className="bg-destructive/5 text-center">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{insightsError}</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Click the button to generate personalized health insights based on your data.</p>
                        </div>
                    )}
                </>
            )}
        </div>

        <div className="flex justify-center items-center gap-4 pt-6 mt-auto">
             <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isButtonDisabled}>
                                <Languages className="h-5 w-5" />
                                <span className="sr-only">Translate</span>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Translate Insights</p>
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup
                        value={selectedInsightsLanguage}
                        onValueChange={handleLanguageChange}
                    >
                        {supportedLanguages.map((lang) => (
                            <DropdownMenuRadioItem key={lang.code} value={lang.code}>
                                {lang.name}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => regenerateInsights(selectedInsightsLanguage)} disabled={isButtonDisabled}>
                <RotateCw className="mr-2 h-4 w-4" />
                Generate New Insights
            </Button>
        </div>
    </UniversalCard>
  );
}

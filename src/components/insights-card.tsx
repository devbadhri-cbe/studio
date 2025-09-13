
'use client';

import { Lightbulb, Loader2, Languages, RotateCw } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { useApp } from '@/context/app-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

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

  return (
    <Card className="h-full shadow-xl flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>AI-Powered Insights</CardTitle>
            <CardDescription>
              Personalized tips to help you manage your overall health.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-6 pt-0">
        <Separator className="mb-6" />
        <div className="flex-1 flex flex-col items-center justify-center">
            {(isGeneratingInsights || isTranslatingInsights) && (
                <div className="flex justify-center items-center flex-1">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">{isTranslatingInsights ? 'Translating...' : 'Generating...'}</p>
                </div>
            )}
            
            {!isGeneratingInsights && !isTranslatingInsights && (
                <>
                    {insightsError ? (
                        <Alert variant="destructive" className="bg-destructive/5 text-center">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{insightsError}</AlertDescription>
                        </Alert>
                    ) : tips.length > 0 ? (
                        <ul className="space-y-3 text-sm list-disc pl-5 self-start">
                            {tips.map((tip, index) => <li key={index}>{tip}</li>)}
                        </ul>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Click the button to generate personalized health insights based on your data.</p>
                        </div>
                    )}
                </>
            )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 mt-auto">
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
      </CardContent>
    </Card>
  );
}

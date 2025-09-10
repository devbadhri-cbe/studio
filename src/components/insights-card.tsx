
'use client';

import { Lightbulb, Loader2, Languages, RotateCw } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { useApp } from '@/context/app-context';
import { getHealthInsights } from '@/ai/flows/health-insights-flow';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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
  const { profile, hba1cRecords, fastingBloodGlucoseRecords, vitaminDRecords, bloodPressureRecords, weightRecords, getDisplayGlucoseValue, getDisplayVitaminDValue } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [originalTips, setOriginalTips] = React.useState<string[]>([]);
  const [translatedTips, setTranslatedTips] = React.useState<string[] | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const [error, setError] = React.useState<string | null>(null);

  const tipsToDisplay = translatedTips || originalTips;

  const handleGenerateInsights = React.useCallback(async (languageCode: string = 'en', isTranslation = false) => {
    if (isTranslation) {
        setIsTranslating(true);
    } else {
        setIsLoading(true);
        setOriginalTips([]);
        setTranslatedTips(null);
    }
    setError(null);
    
    try {
        const latestFastingBloodGlucose = fastingBloodGlucoseRecords.sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
        const latestHba1c = hba1cRecords.sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
        const latestVitaminD = vitaminDRecords.sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
        const latestWeight = weightRecords.sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
        const latestBloodPressure = bloodPressureRecords.sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];

        const result = await getHealthInsights({
            language: supportedLanguages.find(l => l.code === languageCode)?.name || 'English',
            patient: {
                age: profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : undefined,
                gender: profile.gender,
                bmi: profile.bmi,
                conditions: profile.presentMedicalConditions.map(c => c.condition),
                medications: profile.medication.map(m => m.name),
            },
            latestReadings: {
                hba1c: latestHba1c?.value,
                fastingBloodGlucose: latestFastingBloodGlucose ? getDisplayGlucoseValue(latestFastingBloodGlucose.value) : undefined,
                vitaminD: latestVitaminD ? getDisplayVitaminDValue(latestVitaminD.value) : undefined,
                weight: latestWeight?.value,
                bloodPressure: latestBloodPressure ? { systolic: latestBloodPressure.systolic, diastolic: latestBloodPressure.diastolic } : undefined,
            }
        });
        
        if (result.tips) {
            if(isTranslation) {
                setTranslatedTips(result.tips);
            } else {
                setOriginalTips(result.tips);
            }
        } else {
            throw new Error("No tips returned from AI.");
        }

    } catch(e) {
        console.error(e);
        setError('Failed to generate insights. Please try again.');
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate AI insights.' });
    } finally {
        setIsLoading(false);
        setIsTranslating(false);
    }
  }, [
      profile, 
      hba1cRecords, 
      fastingBloodGlucoseRecords, 
      vitaminDRecords, 
      bloodPressureRecords, 
      weightRecords, 
      getDisplayGlucoseValue, 
      getDisplayVitaminDValue
  ]);

  const handleLanguageChange = async (languageCode: string) => {
    if (!languageCode || originalTips.length === 0) return;
    setSelectedLanguage(languageCode);
    
    if (languageCode === 'en') {
        setTranslatedTips(null);
        return;
    }
    
    handleGenerateInsights(languageCode, true);
  }

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
        {(isLoading || isTranslating) && (
            <div className="flex justify-center items-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">{isTranslating ? 'Translating...' : 'Generating...'}</p>
            </div>
        )}
        
        {!isLoading && !isTranslating && (
             <>
                {error ? (
                    <Alert variant="destructive" className="bg-destructive/5 text-center">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : tipsToDisplay.length > 0 ? (
                    <ul className="space-y-3 text-sm list-disc pl-5">
                        {tipsToDisplay.map((tip, index) => <li key={index}>{tip}</li>)}
                    </ul>
                ) : (
                    <div className="text-center text-sm text-muted-foreground flex-1 flex flex-col items-center justify-center">
                        <p>Click the button to generate personalized health insights based on your data.</p>
                    </div>
                )}
             </>
        )}

        <div className="flex justify-between items-center gap-2 pt-6 mt-auto">
            <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isLoading || isTranslating || originalTips.length === 0}>
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
            <Button onClick={() => handleGenerateInsights()} disabled={isLoading || isTranslating}>
                <RotateCw className="mr-2 h-4 w-4" />
                Generate New Insights
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

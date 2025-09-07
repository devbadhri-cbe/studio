
'use client';

import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { getHealthInsights } from '@/ai/flows/get-health-insights-flow';
import { calculateAge } from '@/lib/utils';
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

export function InsightsCard() {
  const { profile, hba1cRecords, bloodPressureRecords, vitaminDRecords, thyroidRecords, fastingBloodGlucoseRecords, hemoglobinRecords, totalCholesterolRecords, ldlRecords, hdlRecords, triglyceridesRecords } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [localTips, setLocalTips] = React.useState<string[]>([]);
  const [translatedTips, setTranslatedTips] = React.useState<string[] | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');
  const { toast } = useToast();

  const handleGetInsights = async () => {
    setIsLoading(true);
    setLocalTips([]);
    setTranslatedTips(null);
    setSelectedLanguage('en');

    try {
      const getLatestRecord = <T extends { date: string | Date }>(records: T[]) => 
        [...(records || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      const latestHba1c = getLatestRecord(hba1cRecords);
      const latestBloodPressure = getLatestRecord(bloodPressureRecords);
      const latestVitaminD = getLatestRecord(vitaminDRecords);
      const latestThyroid = getLatestRecord(thyroidRecords);
      const latestGlucose = getLatestRecord(fastingBloodGlucoseRecords);
      const latestHemoglobin = getLatestRecord(hemoglobinRecords);
      const latestTotalCholesterol = getLatestRecord(totalCholesterolRecords);
      const latestLdl = getLatestRecord(ldlRecords);
      const latestHdl = getLatestRecord(hdlRecords);
      const latestTriglycerides = getLatestRecord(triglyceridesRecords);


      const input = {
          name: profile.name,
          age: calculateAge(profile.dob) || 0,
          gender: profile.gender,
          country: profile.country,
          medication: profile.medication.map(m => m.name),
          presentMedicalConditions: profile.presentMedicalConditions.map(c => c.condition),
          bmi: profile.bmi,
          latestHba1c: latestHba1c?.value,
          latestBloodPressure: latestBloodPressure ? { systolic: latestBloodPressure.systolic, diastolic: latestBloodPressure.diastolic } : undefined,
          latestVitaminD: latestVitaminD?.value,
          latestThyroid: latestThyroid ? { tsh: latestThyroid.tsh } : undefined,
          latestGlucose: latestGlucose?.value,
          latestHemoglobin: latestHemoglobin?.hemoglobin,
          latestTotalCholesterol: latestTotalCholesterol?.value,
          latestLdl: latestLdl?.value,
          latestHdl: latestHdl?.value,
          latestTriglycerides: latestTriglycerides?.value,
      };

      const result = await getHealthInsights(input);
      
      if (result.insights && result.insights.length > 0) {
        setLocalTips(result.insights);
        toast({
          title: 'Insights Generated',
          description: 'New health tips have been created for you.',
        });
      } else {
         toast({
          variant: 'destructive',
          title: 'No Insights Found',
          description: 'The AI could not generate insights based on the current data.',
        });
      }

    } catch (error) {
      console.error("Failed to get insights:", error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Insights',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTranslate = async (languageCode: string) => {
    if (languageCode === 'en') {
        setTranslatedTips(null);
        setSelectedLanguage('en');
        return;
    }
    
    setIsTranslating(true);
    setSelectedLanguage(languageCode);

    try {
        const languageName = supportedLanguages.find(l => l.code === languageCode)?.name || languageCode;
        const response = await translateText({ texts: localTips, targetLanguage: languageName });
        setTranslatedTips(response.translatedTexts);
        toast({
            title: 'Translation Complete',
            description: `Insights have been translated to ${languageName}.`,
        });
    } catch (error) {
        console.error("Translation failed:", error);
        toast({
            variant: 'destructive',
            title: 'Translation Error',
            description: 'Could not translate the insights. Please try again.',
        });
        setTranslatedTips(null);
        setSelectedLanguage('en');
    } finally {
        setIsTranslating(false);
    }
  };

  const tipsToDisplay = translatedTips || localTips;

  return (
    <Card className="h-full shadow-xl">
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
      <CardContent className="space-y-4">
        {(isLoading || isTranslating) && (
            <div className="flex justify-center items-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">{isTranslating ? 'Translating...' : 'Generating...'}</p>
            </div>
        )}

        {!isLoading && !isTranslating && tipsToDisplay.length > 0 && (
          <Alert className="bg-muted/50">
            <AlertDescription className="space-y-4">
              <ul className="space-y-3">
                {tipsToDisplay.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoading && !isTranslating && tipsToDisplay.length === 0 && (
            <div className="flex items-center justify-center text-center text-sm text-muted-foreground min-h-[150px]">
                <div className="space-y-4">
                    <p>Click the button to generate personalized health tips.</p>
                    <Button onClick={handleGetInsights} disabled={isLoading || isTranslating}>
                        {isLoading ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                            </>
                        ) : (
                            'Generate New Insights'
                        )}
                    </Button>
                </div>
            </div>
        )}
        
         {!isLoading && !isTranslating && tipsToDisplay.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Button onClick={handleGetInsights} disabled={isLoading || isTranslating}>
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                    </>
                ) : (
                    'Generate New Insights'
                )}
                </Button>
                {localTips.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Separator orientation="vertical" className="h-full hidden sm:block"/>
                        <Select value={selectedLanguage} onValueChange={handleTranslate} disabled={isTranslating}>
                            <SelectTrigger className="w-full sm:w-[150px] h-9">
                                <SelectValue placeholder="Translate..." />
                            </SelectTrigger>
                            <SelectContent>
                                {supportedLanguages.map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

    

    
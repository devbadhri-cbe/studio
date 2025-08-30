
'use client';

import { getPersonalizedInsights } from '@/ai/flows/personalized-insights';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { calculateAge, calculateBmi } from '@/lib/utils';
import { Lightbulb, Loader2, Languages, Undo2 } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translateText } from '@/ai/flows/translate-text';
import { Alert, AlertDescription } from './ui/alert';

const LANGUAGES = [
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Mandarin', label: 'Mandarin' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Japanese', label: 'Japanese' },
];

export function InsightsCard() {
  const { profile, records, lipidRecords, bloodPressureRecords, tips, setTips, weightRecords } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const [originalTips, setOriginalTips] = React.useState<string[]>([]);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [targetLanguage, setTargetLanguage] = React.useState('');

  const handleGetInsights = async () => {
    if (!profile.name || !profile.dob) {
      toast({
        variant: 'destructive',
        title: 'Unable to get insights',
        description: 'Please complete your profile (name and date of birth) first.',
      });
      return;
    }

    setIsLoading(true);
    setTargetLanguage('');
    try {
      const age = calculateAge(profile.dob);
      if (age === null) throw new Error('Could not calculate age.');

      const hba1cData = records.map((r) => ({ date: new Date(r.date).toISOString(), value: r.value }));
      const lipidData = lipidRecords.map(r => ({date: new Date(r.date).toISOString(), ldl: r.ldl, hdl: r.hdl, total: r.total, triglycerides: r.triglycerides}));
      const bloodPressureData = bloodPressureRecords.map(r => ({date: new Date(r.date).toISOString(), systolic: r.systolic, diastolic: r.diastolic}));
      
      const medicationString = profile.medication.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join(', ');

      const latestWeight = [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const bmi = calculateBmi(latestWeight?.value, profile.height);

      const result = await getPersonalizedInsights({
        hba1cData: hba1cData.length > 0 ? hba1cData : undefined,
        lipidData: lipidData.length > 0 ? lipidData : undefined,
        bloodPressureData: bloodPressureData.length > 0 ? bloodPressureData : undefined,
        previousTips: tips,
        userProfile: {
          name: profile.name,
          age: age,
          gender: profile.gender,
          bmi: bmi || undefined,
          presentMedicalConditions: profile.presentMedicalConditions.map(c => ({
            condition: c.condition,
            date: format(new Date(c.date), 'MMMM d, yyyy'),
            icdCode: c.icdCode
          })),
          medication: medicationString,
        },
      });
      if (result.tips) {
        setTips(result.tips);
        setOriginalTips(result.tips);
        toast({
          title: 'New Insights Generated!',
          description: 'We have new personalized tips for you.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not fetch personalized insights.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
   const handleTranslate = async () => {
    if (!tips.length || !targetLanguage || !originalTips.length) return;

    setIsTranslating(true);
    try {
        const translatedTips = await Promise.all(originalTips.map(async (tip) => {
            const response = await translateText({ text: tip, targetLanguage });
            return response.translatedText;
        }));
        setTips(translatedTips);
    } catch (error) {
         console.error('Error translating text:', error);
         toast({
            variant: 'destructive',
            title: 'Translation Failed',
            description: `Could not translate the insights to ${targetLanguage}.`,
         });
    } finally {
        setIsTranslating(false);
    }
  }

  const handleRevert = () => {
      setTips(originalTips);
  }
  
  const areTipsTranslated = JSON.stringify(tips) !== JSON.stringify(originalTips);

  return (
    <Card className="h-full">
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
        {tips.length > 0 && (
          <Alert className="bg-muted/50">
            <AlertDescription className="space-y-4">
               <div className="flex items-center gap-2">
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Translate..." />
                      </SelectTrigger>
                      <SelectContent>
                          {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <Button onClick={handleTranslate} disabled={isTranslating || !targetLanguage} size="icon" variant="outline">
                      {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                  </Button>
                   {areTipsTranslated && (
                      <Button onClick={handleRevert} size="icon" variant="outline">
                          <Undo2 className="h-4 w-4" />
                      </Button>
                  )}
              </div>
              <ul className="space-y-3">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoading && tips.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
                <p>Click the button to generate personalized health tips.</p>
            </div>
        )}

        <Button onClick={handleGetInsights} disabled={isLoading} className="w-full" size="sm">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate New Insights'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

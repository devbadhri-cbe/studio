
'use client';

import { getPersonalizedInsights } from '@/ai/flows/personalized-insights';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { calculateAge } from '@/lib/utils';
import { Lightbulb, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';

export function InsightsCard() {
  const { profile, records, lipidRecords, tips, setTips } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleGetInsights = async () => {
    const hasRecords = records.length > 0 || lipidRecords.length > 0;

    if (!hasRecords || !profile.name || !profile.dob) {
      toast({
        variant: 'destructive',
        title: 'Unable to get insights',
        description: 'Please add at least one health record and complete your profile first.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const age = calculateAge(profile.dob);
      if (age === null) throw new Error('Could not calculate age.');

      const hba1cData = records.map((r) => ({ date: new Date(r.date).toISOString(), value: r.value }));
      const lipidData = lipidRecords.map(r => ({date: new Date(r.date).toISOString(), ldl: r.ldl, hdl: r.hdl, total: r.total, triglycerides: r.triglycerides}));
      
      const medicationString = profile.medication.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join(', ');

      const result = await getPersonalizedInsights({
        hba1cData: hba1cData.length > 0 ? hba1cData : undefined,
        lipidData: lipidData.length > 0 ? lipidData : undefined,
        previousTips: tips,
        userProfile: {
          name: profile.name,
          age: age,
          gender: profile.gender,
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
      <CardContent>
        {tips.length > 0 ? (
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>No insights yet. Generate insights based on your records.</p>
          </div>
        )}
        <Button onClick={handleGetInsights} disabled={isLoading} className="mt-6 w-full" size="sm">
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

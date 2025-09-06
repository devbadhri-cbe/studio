
'use client';

import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';
import { getHealthInsights } from '@/ai/flows/get-health-insights-flow';
import { calculateAge } from '@/lib/utils';

export function InsightsCard() {
  const { profile, hba1cRecords, bloodPressureRecords, vitaminDRecords, thyroidRecords } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);
  const [localTips, setLocalTips] = React.useState<string[]>([]);
  const { toast } = useToast();

  const handleGetInsights = async () => {
    setIsLoading(true);
    setLocalTips([]);

    try {
      const latestHba1c = [...hba1cRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
      const latestBloodPressure = [...bloodPressureRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
      const latestVitaminD = [...vitaminDRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];
      const latestThyroid = [...thyroidRecords].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];

      const input = {
          name: profile.name,
          age: calculateAge(profile.dob) || 0,
          gender: profile.gender,
          country: profile.country,
          medication: profile.medication.map(m => m.name),
          presentMedicalConditions: profile.presentMedicalConditions.map(c => c.condition),
          latestHba1c: latestHba1c?.value,
          latestBloodPressure: latestBloodPressure ? { systolic: latestBloodPressure.systolic, diastolic: latestBloodPressure.diastolic } : undefined,
          latestVitaminD: latestVitaminD?.value,
          latestThyroid: latestThyroid ? { tsh: latestThyroid.tsh } : undefined,
          bmi: profile.bmi,
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
        {localTips.length > 0 && !isLoading && (
          <Alert className="bg-muted/50">
            <AlertDescription className="space-y-4">
              <ul className="space-y-3">
                {localTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading && (
            <div className="flex justify-center items-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}

        {!isLoading && localTips.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-6">
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

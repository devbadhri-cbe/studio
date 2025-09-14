'use client';

import * as React from 'react';
import { Sparkles, Loader2, Info } from 'lucide-react';
import { UniversalCard } from './universal-card';
import { Button } from './ui/button';
import { useApp } from '@/context/app-context';
import { toast } from '@/hooks/use-toast';
import { differenceInHours, formatDistanceToNow } from 'date-fns';
import { generateInsights, type GenerateInsightsInput } from '@/ai/flows/generate-insights-flow';
import { Alert, AlertDescription } from './ui/alert';

const RATE_LIMIT_HOURS = 12; // Allow generation every 12 hours

export function AiInsightCard() {
  const { patient, setPatient } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);

  if (!patient) return null;

  const handleGenerateInsight = async () => {
    if (patient.lastInsightTimestamp) {
      const hoursSinceLast = differenceInHours(new Date(), new Date(patient.lastInsightTimestamp));
      if (hoursSinceLast < RATE_LIMIT_HOURS) {
        toast({
          title: 'Rate Limit Reached',
          description: `You can generate new insights again in ${RATE_LIMIT_HOURS - hoursSinceLast} hour(s).`,
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // Prepare only the necessary, non-identifiable data for the AI
      const insightInput: GenerateInsightsInput = {
        dob: patient.dob,
        gender: patient.gender,
        height: patient.height,
        bmi: patient.bmi,
        presentMedicalConditions: patient.presentMedicalConditions?.map(c => ({ condition: c.condition })),
        medication: patient.medication?.map(m => ({ name: m.name, dosage: m.dosage })),
        hba1cRecords: patient.hba1cRecords,
        bloodPressureRecords: patient.bloodPressureRecords,
        fastingBloodGlucoseRecords: patient.fastingBloodGlucoseRecords,
      };

      const result = await generateInsights(insightInput);
      
      setPatient({
        ...patient,
        aiInsightText: result.insight,
        aiInsightTimestamp: new Date().toISOString(),
        lastInsightTimestamp: new Date().toISOString(),
      });
      toast({
        title: 'Insight Generated',
        description: 'Your new AI health insight is ready.',
      });

    } catch (error) {
      console.error('Failed to generate insight:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate AI insight. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const insightAge = patient.aiInsightTimestamp ? formatDistanceToNow(new Date(patient.aiInsightTimestamp), { addSuffix: true }) : null;

  return (
    <UniversalCard
      icon={<Sparkles className="h-6 w-6 text-primary" />}
      title="AI Health Insight"
      description={insightAge ? `Generated ${insightAge}` : 'Get an AI-powered summary of your health.'}
    >
      {patient.aiInsightText ? (
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {patient.aiInsightText}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="text-center text-muted-foreground text-sm py-4">
          <p>Click the button to generate a personalized health insight based on your current data.</p>
        </div>
      )}
      <div className="flex justify-center mt-6">
        <Button onClick={handleGenerateInsight} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {patient.aiInsightText ? 'Regenerate Insight' : 'Generate Insight'}
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-4">
        AI insights are for informational purposes only and are not a substitute for professional medical advice.
      </p>
    </UniversalCard>
  );
}

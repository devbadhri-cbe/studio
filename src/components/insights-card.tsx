
'use client';

import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';

export function InsightsCard() {
  const { tips, setTips } = useApp();
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleGetInsights = async () => {
    setIsLoading(true);
    // Placeholder for AI insights
    setTimeout(() => {
        const newTips = [
            "AI-powered insights are temporarily disabled.",
            "Please consult your doctor for personalized health advice based on your records."
        ];
        setTips(newTips);
        setIsLoading(false);
        toast({
          title: 'Feature Disabled',
          description: 'Personalized AI insights are currently unavailable.',
        });
    }, 1000);
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
      <CardContent className={cn("space-y-4", (isLoading || tips.length === 0) && "pt-0")}>
        {tips.length > 0 && (
          <Alert className="bg-muted/50">
            <AlertDescription className="space-y-4">
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
            <div className="text-center text-sm text-muted-foreground">
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

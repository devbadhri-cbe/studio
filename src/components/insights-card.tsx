

'use client';

import { Lightbulb, Loader2 } from 'lucide-react';
import * as React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [localTips, setLocalTips] = React.useState<string[]>([]);
  const [translatedTips, setTranslatedTips] = React.useState<string[] | null>(null);

  const tipsToDisplay = translatedTips || localTips;

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
        
        <div className="pt-0">
            <div className="flex flex-col items-center justify-center text-center gap-4">
                <p className="text-sm text-muted-foreground">AI features are temporarily disabled.</p>
                <Button disabled>
                    Generate New Insights
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

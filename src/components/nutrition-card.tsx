
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Utensils } from 'lucide-react';
import { Badge } from './ui/badge';
import { useDateFormatter } from '@/hooks/use-date-formatter';

export function NutritionCard() {
  const { profile } = useApp();
  const formatDate = useDateFormatter();
  const lastAlbumin = profile.lastAlbumin;

  const getNutritionStatus = (albumin?: number) => {
    if (albumin === undefined || albumin === null) return null;
    
    // Normal range is typically 3.4 to 5.4 g/dL
    const isLow = albumin < 3.4;
    
    return isLow 
        ? { text: 'Low (Malnutrition Risk)', variant: 'destructive' as const }
        : { text: 'Normal', variant: 'outline' as const };
  }
  
  const status = getNutritionStatus(lastAlbumin?.value);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Utensils className="h-5 w-5 text-green-600" />
          <CardTitle>Nutrition Status (Albumin)</CardTitle>
        </div>
        <CardDescription>
          Serum albumin is a key marker for nutritional status, which is important to monitor in later stages of CKD.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastAlbumin ? (
          <div className="flex items-center justify-between rounded-md border bg-muted/50 p-4">
            <div>
              <p className="text-2xl font-bold">{lastAlbumin.value.toFixed(1)} g/dL</p>
              <p className="text-xs text-muted-foreground">
                Last measured on {formatDate(lastAlbumin.date)}
              </p>
            </div>
            {status && <Badge variant={status.variant} className={status.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>{status.text}</Badge>}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">No albumin data available.</p>
        )}
      </CardContent>
    </Card>
  );
}

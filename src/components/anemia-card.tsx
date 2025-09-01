
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Droplet } from 'lucide-react';
import { Badge } from './ui/badge';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddAnemiaRecordDialog } from './add-anemia-record-dialog';

export function AnemiaCard() {
  const { profile } = useApp();
  const formatDate = useDateFormatter();
  const lastHemoglobin = profile.lastHemoglobin;

  const getAnemiaStatus = (hemoglobin?: number) => {
    if (hemoglobin === undefined || hemoglobin === null) return null;

    let isAnemic = false;
    if (profile.gender === 'male' && hemoglobin < 13.5) {
        isAnemic = true;
    } else if (profile.gender === 'female' && hemoglobin < 12.0) {
        isAnemic = true;
    }
    
    return isAnemic 
        ? { text: 'Anemia Present', variant: 'destructive' as const }
        : { text: 'Normal', variant: 'outline' as const };
  }
  
  const status = getAnemiaStatus(lastHemoglobin?.value);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <div className="flex items-center gap-3">
              <Droplet className="h-5 w-5 text-destructive" />
              <CardTitle>Anemia (Hemoglobin)</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Anemia is a common complication of CKD. Hemoglobin levels are monitored to guide treatment.
            </CardDescription>
        </div>
        <AddAnemiaRecordDialog />
      </CardHeader>
      <CardContent className="space-y-4">
        {lastHemoglobin ? (
          <div className="flex items-center justify-between rounded-md border bg-muted/50 p-4">
            <div>
              <p className="text-2xl font-bold">{lastHemoglobin.value.toFixed(1)} g/dL</p>
              <p className="text-xs text-muted-foreground">
                Last measured on {formatDate(lastHemoglobin.date)}
              </p>
            </div>
            {status && <Badge variant={status.variant} className={status.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>{status.text}</Badge>}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">No hemoglobin data available.</p>
        )}
      </CardContent>
    </Card>
  );
}

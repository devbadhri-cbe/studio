'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Droplet } from 'lucide-react';
import { AddFastingBloodGlucoseRecordDialog } from './add-fasting-blood-glucose-record-dialog';
import { FastingBloodGlucoseChart } from './fasting-blood-glucose-chart';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { BiomarkerCard } from './biomarker-card';
import type { FastingBloodGlucoseRecord } from '@/lib/types';

interface FastingBloodGlucoseCardProps {
  isReadOnly?: boolean;
}

export function FastingBloodGlucoseCard({ isReadOnly = false }: FastingBloodGlucoseCardProps) {
  const { fastingBloodGlucoseRecords, removeFastingBloodGlucoseRecord, getDisplayGlucoseValue, biomarkerUnit, setBiomarkerUnit } = useApp();

  const getStatus = (record: FastingBloodGlucoseRecord) => {
    // Status is always checked against the stored mg/dL value
    if (record.value < 100) return { text: 'Normal', variant: 'outline' as const };
    if (record.value <= 125) return { text: 'Prediabetes', variant: 'secondary' as const };
    return { text: 'Diabetes', variant: 'destructive' as const };
  }
  
  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';
  
  const formatRecord = (record: FastingBloodGlucoseRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${getDisplayGlucoseValue(record.value)}`
  });

  const UnitSwitch = (
    <div className="flex items-center justify-center space-x-2 px-2 py-1">
        <Label htmlFor="unit-switch-fbg" className="text-xs">mg/dL</Label>
        <Switch
            id="unit-switch-fbg"
            checked={biomarkerUnit === 'si'}
            onCheckedChange={(checked) => setBiomarkerUnit(checked ? 'si' : 'conventional')}
        />
        <Label htmlFor="unit-switch-fbg" className="text-xs">mmol/L</Label>
    </div>
  );

  return (
    <BiomarkerCard<FastingBloodGlucoseRecord>
      title={`Fasting Blood Glucose (${unitLabel})`}
      icon={<Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={fastingBloodGlucoseRecords}
      onRemoveRecord={removeFastingBloodGlucoseRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddFastingBloodGlucoseRecordDialog />}
      chart={<FastingBloodGlucoseChart />}
      unitSwitch={UnitSwitch}
      isReadOnly={isReadOnly}
    />
  );
}

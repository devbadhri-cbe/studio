
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Heart } from 'lucide-react';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';
import { BloodPressureChart } from './blood-pressure-chart';
import { BiomarkerCard } from './biomarker-card';
import type { BloodPressureRecord } from '@/lib/types';

interface BloodPressureCardProps {
  isReadOnly?: boolean;
}

export function BloodPressureCard({ isReadOnly = false }: BloodPressureCardProps) {
  const { bloodPressureRecords, removeBloodPressureRecord } = useApp();
  
  const getStatus = (record?: BloodPressureRecord) => {
    if (!record) return null;
    if (record.systolic >= 140 || record.diastolic >= 90) return { text: 'Stage 2 HTN', variant: 'destructive' as const };
    if (record.systolic >= 130 || record.diastolic >= 80) return { text: 'Stage 1 HTN', variant: 'secondary' as const };
    if (record.systolic >= 120) return { text: 'Elevated', variant: 'secondary' as const };
    return { text: 'Normal', variant: 'outline' as const };
  }

  const formatRecord = (record: BloodPressureRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${record.systolic}/${record.diastolic}`
  });
  
  return (
    <BiomarkerCard<BloodPressureRecord>
      title="Blood Pressure (mmHg)"
      icon={<Heart className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={bloodPressureRecords}
      onRemoveRecord={removeBloodPressureRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddBloodPressureRecordDialog />}
      chart={<BloodPressureChart />}
      isReadOnly={isReadOnly}
    />
  );
}

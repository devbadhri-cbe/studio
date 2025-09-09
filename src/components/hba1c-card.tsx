'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Droplet } from 'lucide-react';
import { AddRecordDialog } from './add-record-dialog';
import { Hba1cChart } from './hba1c-chart';
import { type Hba1cRecord } from '@/lib/types';
import { BiomarkerCard } from './biomarker-card';

interface Hba1cCardProps {
  isReadOnly?: boolean;
}

export function Hba1cCard({ isReadOnly = false }: Hba1cCardProps) {
  const { hba1cRecords, removeHba1cRecord } = useApp();
  
  const getStatus = (record: Hba1cRecord) => {
    if (record.value < 4.0) return { text: 'Low', variant: 'default' as const };
    if (record.value <= 5.6) return { text: 'Healthy', variant: 'outline' as const };
    if (record.value <= 6.4) return { text: 'Prediabetes', variant: 'secondary' as const };
    return { text: 'Diabetes', variant: 'destructive' as const };
  }

  const formatRecord = (record: Hba1cRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${record.value.toFixed(1)}%`
  });

  return (
    <BiomarkerCard<Hba1cRecord>
      title="HbA1c (%)"
      icon={<Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={hba1cRecords}
      onRemoveRecord={removeHba1cRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddRecordDialog />}
      chart={<Hba1cChart />}
      isReadOnly={isReadOnly}
    />
  );
}

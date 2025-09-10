
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Activity } from 'lucide-react';
import { AddThyroxineRecordDialog } from './add-thyroxine-record-dialog';
import { ThyroxineChart } from './thyroxine-chart';
import { BiomarkerCard } from './biomarker-card';
import type { ThyroxineRecord } from '@/lib/types';

interface ThyroxineCardProps {
  isReadOnly?: boolean;
}

export function ThyroxineCard({ isReadOnly = false }: ThyroxineCardProps) {
  const { thyroxineRecords, removeThyroxineRecord } = useApp();

  const getStatus = (record: ThyroxineRecord) => {
    if (record.value < 4.5) return { text: 'Low', variant: 'secondary' as const };
    if (record.value > 11.7) return { text: 'High', variant: 'destructive' as const };
    return { text: 'Normal', variant: 'outline' as const };
  }

  const formatRecord = (record: ThyroxineRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${record.value.toFixed(1)} ng/dL`
  });

  return (
    <BiomarkerCard<ThyroxineRecord>
      title="Thyroxine (T4)"
      icon={<Activity className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={thyroxineRecords}
      onRemoveRecord={removeThyroxineRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddThyroxineRecordDialog />}
      chart={<ThyroxineChart />}
      isReadOnly={isReadOnly}
    />
  );
}

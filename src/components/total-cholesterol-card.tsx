
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Flame } from 'lucide-react';
import { AddTotalCholesterolRecordDialog } from './add-total-cholesterol-record-dialog';
import { TotalCholesterolChart } from './total-cholesterol-chart';
import { BiomarkerCard } from './biomarker-card';
import type { TotalCholesterolRecord } from '@/lib/types';

interface TotalCholesterolCardProps {
  isReadOnly?: boolean;
}

export function TotalCholesterolCard({ isReadOnly = false }: TotalCholesterolCardProps) {
  const { totalCholesterolRecords, removeTotalCholesterolRecord } = useApp();
  
  const getStatus = (record: TotalCholesterolRecord) => {
    if (record.value < 200) return { text: 'Desirable', variant: 'outline' as const };
    if (record.value < 240) return { text: 'Borderline High', variant: 'secondary' as const };
    return { text: 'High', variant: 'destructive' as const };
  }

  const formatRecord = (record: TotalCholesterolRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${record.value} mg/dL`
  });

  return (
    <BiomarkerCard<TotalCholesterolRecord>
      title="Total Cholesterol (mg/dL)"
      icon={<Flame className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={totalCholesterolRecords}
      onRemoveRecord={removeTotalCholesterolRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddTotalCholesterolRecordDialog />}
      chart={<TotalCholesterolChart />}
      isReadOnly={isReadOnly}
    />
  );
}

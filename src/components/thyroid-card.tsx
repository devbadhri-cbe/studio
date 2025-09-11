'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Activity } from 'lucide-react';
import { AddThyroidRecordDialog } from './add-thyroid-record-dialog';
import { ThyroidChart } from './thyroid-chart';
import { BiomarkerCard } from './biomarker-card';
import type { ThyroidRecord } from '@/lib/types';

interface ThyroidCardProps {
  isReadOnly?: boolean;
}

export function ThyroidCard({ isReadOnly = false }: ThyroidCardProps) {
  const { thyroidRecords, removeThyroidRecord } = useApp();

  const getStatus = (record?: ThyroidRecord) => {
    if (!record) return null;
    if (record.tsh < 0.4) return { text: 'Low (Hyper)', variant: 'secondary' as const };
    if (record.tsh > 4.0) return { text: 'High (Hypo)', variant: 'destructive' as const };
    return { text: 'Normal', variant: 'outline' as const };
  };
  
  const formatRecord = (record: ThyroidRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `TSH: ${record.tsh.toFixed(2)}`
  });

  return (
    <BiomarkerCard<ThyroidRecord>
      title="Thyroid (TSH)"
      icon={<Activity className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={thyroidRecords}
      onRemoveRecord={removeThyroidRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddThyroidRecordDialog />}
      chart={<ThyroidChart />}
      isReadOnly={isReadOnly}
    />
  );
}


'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Droplet } from 'lucide-react'; // Using droplet as a placeholder icon
import { AddSerumCreatinineRecordDialog } from './add-serum-creatinine-record-dialog';
import { SerumCreatinineChart } from './serum-creatinine-chart';
import { BiomarkerCard } from './biomarker-card';
import type { SerumCreatinineRecord } from '@/lib/types';

interface SerumCreatinineCardProps {
  isReadOnly?: boolean;
}

export function SerumCreatinineCard({ isReadOnly = false }: SerumCreatinineCardProps) {
  const { serumCreatinineRecords, removeSerumCreatinineRecord, profile } = useApp();

  const getStatus = (record: SerumCreatinineRecord) => {
    if (!record) return null;
    const isMale = profile.gender === 'male';
    const upperNormal = isMale ? 1.2 : 1.0;

    if (record.value > upperNormal) return { text: 'High', variant: 'destructive' as const };
    return { text: 'Normal', variant: 'outline' as const };
  }

  const formatRecord = (record: SerumCreatinineRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${record.value.toFixed(2)} mg/dL`
  });

  return (
    <BiomarkerCard<SerumCreatinineRecord>
      title="Serum Creatinine"
      icon={<Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={serumCreatinineRecords}
      onRemoveRecord={removeSerumCreatinineRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddSerumCreatinineRecordDialog />}
      chart={<SerumCreatinineChart />}
      isReadOnly={isReadOnly}
    />
  );
}

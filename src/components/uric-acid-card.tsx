
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Droplet } from 'lucide-react';
import { AddUricAcidRecordDialog } from './add-uric-acid-record-dialog';
import { UricAcidChart } from './uric-acid-chart';
import { BiomarkerCard } from './biomarker-card';
import type { UricAcidRecord } from '@/lib/types';

interface UricAcidCardProps {
  isReadOnly?: boolean;
}

export function UricAcidCard({ isReadOnly = false }: UricAcidCardProps) {
  const { uricAcidRecords, removeUricAcidRecord, profile } = useApp();

  const getStatus = (record: UricAcidRecord) => {
    if (!record) return null;
    const isMale = profile.gender === 'male';
    
    // Normal range: Male 3.4-7.0 mg/dL, Female 2.4-6.0 mg/dL
    if (isMale) {
      if (record.value > 7.0) return { text: 'High', variant: 'destructive' as const };
      if (record.value < 3.4) return { text: 'Low', variant: 'secondary' as const };
    } else {
      if (record.value > 6.0) return { text: 'High', variant: 'destructive' as const };
      if (record.value < 2.4) return { text: 'Low', variant: 'secondary' as const };
    }
    return { text: 'Normal', variant: 'outline' as const };
  }

  const formatRecord = (record: UricAcidRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${record.value.toFixed(1)} mg/dL`
  });

  return (
    <BiomarkerCard<UricAcidRecord>
      title="Uric Acid"
      icon={<Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={uricAcidRecords || []}
      onRemoveRecord={removeUricAcidRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddUricAcidRecordDialog />}
      chart={<UricAcidChart />}
      isReadOnly={isReadOnly}
    />
  );
}

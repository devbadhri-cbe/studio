
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Flame } from 'lucide-react';
import { AddLipidRecordDialog } from './add-lipid-record-dialog';
import { LipidChart } from './lipid-chart';
import { BiomarkerCard } from './biomarker-card';
import type { LipidRecord } from '@/lib/types';

interface LipidCardProps {
  isReadOnly?: boolean;
}

export function LipidCard({ isReadOnly = false }: LipidCardProps) {
  const { lipidRecords, removeLipidRecord } = useApp();

  const getStatus = (record: LipidRecord) => {
    if (record.ldl < 100) return { text: 'Optimal', variant: 'outline' as const };
    if (record.ldl < 130) return { text: 'Near Optimal', variant: 'default' as const };
    if (record.ldl < 160) return { text: 'Borderline High', variant: 'secondary' as const };
    if (record.ldl < 190) return { text: 'High', variant: 'destructive' as const };
    return { text: 'Very High', variant: 'destructive' as const };
  }
  
  const formatRecord = (record: LipidRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `TC: ${record.value}`
  });

  return (
    <BiomarkerCard<LipidRecord>
      title="Lipid Panel (Full)"
      icon={<Flame className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={lipidRecords}
      onRemoveRecord={removeLipidRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddLipidRecordDialog />}
      chart={<LipidChart />}
      isReadOnly={isReadOnly}
    />
  );
}

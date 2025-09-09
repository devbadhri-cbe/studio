
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Flame } from 'lucide-react';
import { AddTriglyceridesRecordDialog } from './add-triglycerides-record-dialog';
import { TriglyceridesChart } from './triglycerides-chart';
import { BiomarkerCard } from './biomarker-card';
import type { TriglyceridesRecord } from '@/lib/types';

interface TriglyceridesCardProps {
  isReadOnly?: boolean;
}

export function TriglyceridesCard({ isReadOnly = false }: TriglyceridesCardProps) {
  const { triglyceridesRecords, removeTriglyceridesRecord, getDisplayLipidValue, biomarkerUnit, setBiomarkerUnit } = useApp();

  const getStatus = (record: TriglyceridesRecord) => {
    // Status logic is always based on the stored mg/dL value
    if (record.value < 150) return { text: 'Normal', variant: 'outline' as const };
    if (record.value < 200) return { text: 'Borderline High', variant: 'secondary' as const };
    if (record.value < 500) return { text: 'High', variant: 'destructive' as const };
    return { text: 'Very High', variant: 'destructive' as const };
  }

  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';

  const formatRecord = (record: TriglyceridesRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${getDisplayLipidValue(record.value, 'triglycerides')}`
  });

  const unitSwitchProps = {
    labelA: 'mg/dL',
    labelB: 'mmol/L',
    isChecked: biomarkerUnit === 'si',
    onCheckedChange: (checked: boolean) => setBiomarkerUnit(checked ? 'si' : 'conventional'),
  };

  return (
    <BiomarkerCard<TriglyceridesRecord>
      title={`Triglycerides (${unitLabel})`}
      icon={<Flame className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={triglyceridesRecords}
      onRemoveRecord={removeTriglyceridesRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddTriglyceridesRecordDialog />}
      chart={<TriglyceridesChart />}
      isReadOnly={isReadOnly}
      unitSwitch={unitSwitchProps}
    />
  );
}

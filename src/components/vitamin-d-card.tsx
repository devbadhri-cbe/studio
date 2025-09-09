'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Sun } from 'lucide-react';
import { AddVitaminDRecordDialog } from './add-vitamin-d-record-dialog';
import { VitaminDChart } from './vitamin-d-chart';
import { BiomarkerCard } from './biomarker-card';
import type { VitaminDRecord } from '@/lib/types';

interface VitaminDCardProps {
    isReadOnly?: boolean;
}

export function VitaminDCard({ isReadOnly = false }: VitaminDCardProps) {
  const { vitaminDRecords, removeVitaminDRecord, getDisplayVitaminDValue, biomarkerUnit, setBiomarkerUnit } = useApp();

  const getStatus = (record: VitaminDRecord) => {
    // Status based on ng/mL
    if (record.value < 20) return { text: 'Deficient', variant: 'destructive' as const };
    if (record.value < 30) return { text: 'Insufficient', variant: 'secondary' as const };
    return { text: 'Sufficient', variant: 'outline' as const };
  };

  const unitLabel = biomarkerUnit === 'si' ? 'nmol/L' : 'ng/mL';

  const formatRecord = (record: VitaminDRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${getDisplayVitaminDValue(record.value)}`
  });

  const unitSwitchProps = {
    labelA: 'ng/mL',
    labelB: 'nmol/L',
    isChecked: biomarkerUnit === 'si',
    onCheckedChange: (checked: boolean) => setBiomarkerUnit(checked ? 'si' : 'conventional'),
  };

  return (
    <BiomarkerCard<VitaminDRecord>
      title={`Vitamin D (${unitLabel})`}
      icon={<Sun className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={vitaminDRecords}
      onRemoveRecord={removeVitaminDRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddVitaminDRecordDialog />}
      chart={<VitaminDChart />}
      unitSwitch={unitSwitchProps}
      isReadOnly={isReadOnly}
    />
  );
}


'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Flame } from 'lucide-react';
import { AddHdlRecordDialog } from './add-hdl-record-dialog';
import { HdlChart } from './hdl-chart';
import { BiomarkerCard } from './biomarker-card';
import type { HdlRecord } from '@/lib/types';

interface HdlCardProps {
  isReadOnly?: boolean;
}

export function HdlCard({ isReadOnly = false }: HdlCardProps) {
  const { hdlRecords, removeHdlRecord, profile, getDisplayLipidValue, biomarkerUnit, setBiomarkerUnit } = useApp();

  const getStatus = (record: HdlRecord) => {
    // Status logic is always based on the stored mg/dL value
    const isMale = profile.gender === 'male';
    if (isMale) {
        if (record.value < 40) return { text: 'Low', variant: 'destructive' as const };
    } else {
        if (record.value < 50) return { text: 'Low', variant: 'destructive' as const };
    }
    if (record.value >= 60) return { text: 'Optimal', variant: 'outline' as const };
    return { text: 'Normal', variant: 'outline' as const };
  }
  
  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';

  const formatRecord = (record: HdlRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${getDisplayLipidValue(record.value, 'hdl')}`
  });

  const unitSwitchProps = {
    labelA: 'mg/dL',
    labelB: 'mmol/L',
    isChecked: biomarkerUnit === 'si',
    onCheckedChange: (checked: boolean) => setBiomarkerUnit(checked ? 'si' : 'conventional'),
  };

  return (
    <BiomarkerCard<HdlRecord>
      title={`HDL Cholesterol (${unitLabel})`}
      icon={<Flame className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={hdlRecords}
      onRemoveRecord={removeHdlRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddHdlRecordDialog />}
      chart={<HdlChart />}
      isReadOnly={isReadOnly}
      unitSwitch={unitSwitchProps}
    />
  );
}

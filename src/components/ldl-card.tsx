
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Flame } from 'lucide-react';
import { AddLdlRecordDialog } from './add-ldl-record-dialog';
import { LdlChart } from './ldl-chart';
import { BiomarkerCard } from './biomarker-card';
import type { LdlRecord } from '@/lib/types';

interface LdlCardProps {
  isReadOnly?: boolean;
}

export function LdlCard({ isReadOnly = false }: LdlCardProps) {
  const { ldlRecords, removeLdlRecord, getDisplayLipidValue, biomarkerUnit, setBiomarkerUnit } = useApp();

  const getStatus = (record: LdlRecord) => {
    // Status logic is always based on the stored mg/dL value
    if (record.value < 100) return { text: 'Optimal', variant: 'outline' as const };
    if (record.value < 130) return { text: 'Near Optimal', variant: 'default' as const };
    if (record.value < 160) return { text: 'Borderline High', variant: 'secondary' as const };
    if (record.value < 190) return { text: 'High', variant: 'destructive' as const };
    return { text: 'Very High', variant: 'destructive' as const };
  }

  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';

  const formatRecord = (record: LdlRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${getDisplayLipidValue(record.value, 'ldl')}`
  });

  const unitSwitchProps = {
    labelA: 'mg/dL',
    labelB: 'mmol/L',
    isChecked: biomarkerUnit === 'si',
    onCheckedChange: (checked: boolean) => setBiomarkerUnit(checked ? 'si' : 'conventional'),
  };

  return (
    <BiomarkerCard<LdlRecord>
      title={`LDL Cholesterol (${unitLabel})`}
      icon={<Flame className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={ldlRecords}
      onRemoveRecord={removeLdlRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddLdlRecordDialog />}
      chart={<LdlChart />}
      isReadOnly={isReadOnly}
      unitSwitch={unitSwitchProps}
    />
  );
}

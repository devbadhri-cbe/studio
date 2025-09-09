'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Droplet } from 'lucide-react';
import { AddHemoglobinRecordDialog } from './add-hemoglobin-record-dialog';
import { HemoglobinChart } from './hemoglobin-chart';
import { BiomarkerCard } from './biomarker-card';
import type { HemoglobinRecord } from '@/lib/types';

interface HemoglobinCardProps {
  isReadOnly?: boolean;
}

export function HemoglobinCard({ isReadOnly = false }: HemoglobinCardProps) {
  const { hemoglobinRecords, removeHemoglobinRecord, profile, biomarkerUnit, setBiomarkerUnit, getDisplayHemoglobinValue } = useApp();
  
  const getStatus = (record: HemoglobinRecord) => {
    if (record.hemoglobin === undefined || profile.gender === undefined) return null;

    let isAnemic = false;
    if (profile.gender === 'male' && record.hemoglobin < 13.5) {
        isAnemic = true;
    } else if (profile.gender === 'female' && record.hemoglobin < 12.0) {
        isAnemic = true;
    }
    
    return isAnemic 
        ? { text: 'Anemia Present', variant: 'destructive' as const }
        : { text: 'Normal', variant: 'outline' as const };
  }
  
  const unitLabel = biomarkerUnit === 'si' ? 'g/L' : 'g/dL';

  const formatRecord = (record: HemoglobinRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: `${getDisplayHemoglobinValue(record.hemoglobin)}`
  });

  const unitSwitchProps = {
    labelA: 'g/dL',
    labelB: 'g/L',
    isChecked: biomarkerUnit === 'si',
    onCheckedChange: (checked: boolean) => setBiomarkerUnit(checked ? 'si' : 'conventional'),
  };
  
  return (
    <BiomarkerCard<HemoglobinRecord>
      title={`Hemoglobin (${unitLabel})`}
      icon={<Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />}
      records={hemoglobinRecords}
      onRemoveRecord={removeHemoglobinRecord}
      getStatus={getStatus}
      formatRecord={formatRecord}
      addRecordDialog={<AddHemoglobinRecordDialog />}
      chart={<HemoglobinChart />}
      unitSwitch={unitSwitchProps}
      isReadOnly={isReadOnly}
    />
  );
}

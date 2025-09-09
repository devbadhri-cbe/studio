'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Droplet } from 'lucide-react';
import { AddHemoglobinRecordDialog } from './add-hemoglobin-record-dialog';
import { HemoglobinChart } from './hemoglobin-chart';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
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

  const UnitSwitch = (
    <div className="flex items-center justify-center space-x-2 px-2 py-1">
        <Label htmlFor="unit-switch-anemia" className="text-xs">g/dL</Label>
        <Switch
            id="unit-switch-anemia"
            checked={biomarkerUnit === 'si'}
            onCheckedChange={(checked) => setBiomarkerUnit(checked ? 'si' : 'conventional')}
        />
        <Label htmlFor="unit-switch-anemia" className="text-xs">g/L</Label>
    </div>
  );
  
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
      unitSwitch={UnitSwitch}
      isReadOnly={isReadOnly}
    />
  );
}

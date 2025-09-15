
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Weight, Edit } from 'lucide-react';
import { AddWeightRecordDialog } from './add-weight-record-dialog';
import { kgToLbs, getBmiStatus, cmToFtIn } from '@/lib/utils';
import { WeightChart } from './weight-chart';
import { Badge } from './ui/badge';
import type { EditHeightDialogHandles } from './edit-height-dialog';
import { BiomarkerCard } from './biomarker-card';
import { DropdownMenuItem } from './ui/dropdown-menu';
import type { WeightRecord } from '@/lib/types';
import { EditHeightDialog } from './edit-height-dialog';
import { Separator } from './ui/separator';

interface WeightRecordCardProps {
    isReadOnly?: boolean;
}

export function WeightRecordCard({ isReadOnly = false }: WeightRecordCardProps) {
  const { profile, removeWeightRecord, setProfile } = useApp();
  if (!profile) return null;

  const isImperial = profile.unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const editHeightDialogRef = React.useRef<EditHeightDialogHandles>(null);
  
  const bmiStatus = getBmiStatus(profile.bmi);

  let heightDisplay = 'N/A';
  if (profile.height) {
    if (isImperial) {
        const { feet, inches } = cmToFtIn(profile.height);
        heightDisplay = `${feet}' ${inches}"`;
    } else {
        heightDisplay = `${profile.height} cm`;
    }
  }

  const formatRecord = (record: WeightRecord) => ({
      id: record.id,
      date: record.date as string,
      displayValue: isImperial
        ? `${kgToLbs(record.value).toFixed(1)} lbs`
        : `${record.value.toFixed(1)} kg`
  });
  
  const unitSwitchProps = {
    unitSwitchLabel: 'Weight Units',
    labelA: 'kg',
    labelB: 'lbs',
    isChecked: isImperial,
    onCheckedChange: (checked: boolean) => setProfile({...profile, unitSystem: checked ? 'imperial' : 'metric'})
  };

  const getStatus = () => {
    return (
        <div className="flex items-center justify-around gap-2 text-xs w-full">
            <div className="text-center">
                <div className="text-muted-foreground">Height</div>
                <div className="font-semibold text-foreground">{heightDisplay}</div>
            </div>
            {bmiStatus && (
                <div className="flex flex-col items-center">
                    <Badge variant={bmiStatus.variant} className={bmiStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>
                        {bmiStatus.text}
                    </Badge>
                </div>
            )}
             <div className="text-center">
                <div className="text-muted-foreground">BMI</div>
                <div className="font-semibold text-foreground">{profile.bmi?.toFixed(1) || 'N/A'}</div>
            </div>
        </div>
    );
  };
  

  const EditHeightItem = (
    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); editHeightDialogRef.current?.open(); }}>
        <Edit className="mr-2 h-4 w-4"/>
        Edit Height
    </DropdownMenuItem>
  )

  return (
    <>
    <BiomarkerCard<WeightRecord>
        title={`Weight & BMI (${weightUnit})`}
        icon={<Weight className="h-5 w-5 shrink-0 text-muted-foreground" />}
        records={profile.weightRecords}
        onRemoveRecord={removeWeightRecord}
        getStatus={getStatus}
        formatRecord={formatRecord}
        addRecordDialog={<AddWeightRecordDialog />}
        chart={<WeightChart />}
        unitSwitch={unitSwitchProps}
        isReadOnly={isReadOnly}
        editMenuItems={EditHeightItem}
    />
    <EditHeightDialog ref={editHeightDialogRef} />
    </>
  );
}

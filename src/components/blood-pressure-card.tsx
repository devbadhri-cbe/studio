
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Heart, Settings } from 'lucide-react';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';
import { BloodPressureChart } from './blood-pressure-chart';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BiomarkerCardTemplate } from './biomarker-card-template';

interface BloodPressureCardProps {
  isReadOnly?: boolean;
}

export function BloodPressureCard({ isReadOnly = false }: BloodPressureCardProps) {
  const { bloodPressureRecords, removeBloodPressureRecord } = useApp();

  const sortedRecords = React.useMemo(() => {
    return [...(bloodPressureRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [bloodPressureRecords]);
  
  const getStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return { text: 'Stage 2 HTN', variant: 'destructive' as const };
    if (systolic >= 130 || diastolic >= 80) return { text: 'Stage 1 HTN', variant: 'secondary' as const };
    if (systolic >= 120) return { text: 'Elevated', variant: 'secondary' as const };
    return { text: 'Normal', variant: 'outline' as const };
  }
  
  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.systolic, latestRecord.diastolic) : null;

  const Title = 'Blood Pressure';
  const Icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
    <AddBloodPressureRecordDialog>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Add New Record
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </AddBloodPressureRecordDialog>
  ) : null;

  const formattedRecords = sortedRecords.map(r => ({
      id: r.id,
      date: r.date as string,
      displayValue: `${r.systolic}/${r.diastolic}`
  }));

  const StatusDisplay = (
    <div className="text-center text-xs text-muted-foreground flex items-center justify-center h-full">
      {currentStatus ? (
        <div className="flex flex-col items-center gap-1">
            <span>Current Status:</span>
            <Badge variant={currentStatus.variant} className={currentStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>
            {currentStatus.text}
            </Badge>
        </div>
      ) : <p>No status</p>}
    </div>
  );

  const Chart = <BloodPressureChart />;
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      records={formattedRecords}
      onDeleteRecord={removeBloodPressureRecord}
      statusDisplay={StatusDisplay}
      chart={Chart}
      className="shadow-xl"
      hasRecords={(bloodPressureRecords || []).length > 0}
      noRecordsMessage="No blood pressure records yet."
      statusVariant={currentStatus?.variant}
      isReadOnly={isReadOnly}
    />
  );
}

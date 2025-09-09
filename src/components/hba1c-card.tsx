
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Droplet, Settings } from 'lucide-react';
import { Badge } from './ui/badge';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { AddRecordDialog } from './add-record-dialog';
import { Hba1cChart } from './hba1c-chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Hba1cCardProps {
  isReadOnly?: boolean;
}

export function Hba1cCard({ isReadOnly = false }: Hba1cCardProps) {
  const { hba1cRecords, removeHba1cRecord } = useApp();

  const sortedRecords = React.useMemo(() => {
    return [...(hba1cRecords || [])].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
  }, [hba1cRecords]);
  
  const getStatus = (value: number) => {
    if (value < 4.0) return { text: 'Low', variant: 'default' as const };
    if (value <= 5.6) return { text: 'Healthy', variant: 'outline' as const };
    if (value <= 6.4) return { text: 'Prediabetes', variant: 'secondary' as const };
    return { text: 'Diabetes', variant: 'destructive' as const };
  }
  
  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.value) : null;

  const Title = 'HbA1c (%)';
  const Icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
    <AddRecordDialog>
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
    </AddRecordDialog>
  ) : null;
  
  const formattedRecords = sortedRecords.map(r => ({
      id: r.id,
      date: r.date as string,
      displayValue: `${r.value.toFixed(1)}%`
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
      ): <p>No status</p>}
    </div>
  );

  const Chart = <Hba1cChart />;
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      records={formattedRecords}
      onDeleteRecord={removeHba1cRecord}
      statusDisplay={StatusDisplay}
      chart={Chart}
      hasRecords={(hba1cRecords || []).length > 0}
      statusVariant={currentStatus?.variant}
      isReadOnly={isReadOnly}
    />
  );
}

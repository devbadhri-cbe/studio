
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Activity, Settings, Edit } from 'lucide-react';
import { AddThyroidRecordDialog } from './add-thyroid-record-dialog';
import { ThyroidChart } from './thyroid-chart';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { BiomarkerCardTemplate } from './biomarker-card-template';

interface ThyroidCardProps {
  isReadOnly?: boolean;
}

export function ThyroidCard({ isReadOnly = false }: ThyroidCardProps) {
  const { thyroidRecords, removeThyroidRecord } = useApp();
  const [isEditMode, setIsEditMode] = React.useState(false);

  const sortedRecords = React.useMemo(() => {
    return [...(thyroidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [thyroidRecords]);

  const getStatus = (tsh: number) => {
    if (tsh < 0.4) return { text: 'Low (Hyper)', variant: 'secondary' as const };
    if (tsh > 4.0) return { text: 'High (Hypo)', variant: 'destructive' as const };
    return { text: 'Normal', variant: 'outline' as const };
  };
  
  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.tsh) : null;

  const Title = 'Thyroid (TSH)';
  const Icon = <Activity className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
                <Settings className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
            <AddThyroidRecordDialog>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Add New Record
                </DropdownMenuItem>
            </AddThyroidRecordDialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setIsEditMode(prev => !prev)} disabled={sortedRecords.length === 0}>
                <Edit className="mr-2 h-4 w-4" />
                {isEditMode ? 'Done Editing' : 'Edit Records'}
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const formattedRecords = sortedRecords.map(r => ({
      id: r.id,
      date: r.date as string,
      displayValue: `TSH: ${r.tsh.toFixed(2)}`
  }));

  const StatusDisplay = (
    <div className="text-center text-xs text-muted-foreground flex items-center justify-center h-full">
      {currentStatus ? (
        <div className="flex flex-col items-center gap-1">
          <span>Current TSH Status:</span>
          <Badge variant={currentStatus.variant} className={currentStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>
            {currentStatus.text}
          </Badge>
        </div>
      ) : <p>No status</p>}
    </div>
  );

  const Chart = <ThyroidChart />;

  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      records={formattedRecords}
      onDeleteRecord={removeThyroidRecord}
      statusDisplay={StatusDisplay}
      chart={Chart}
      hasRecords={(thyroidRecords || []).length > 0}
      noRecordsMessage="No thyroid records yet."
      statusVariant={currentStatus?.variant}
      isReadOnly={isReadOnly}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
    />
  );
}

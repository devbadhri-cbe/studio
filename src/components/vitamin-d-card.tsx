
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Sun, Settings } from 'lucide-react';
import { AddVitaminDRecordDialog } from './add-vitamin-d-record-dialog';
import { VitaminDChart } from './vitamin-d-chart';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { BiomarkerCardTemplate } from './biomarker-card-template';

interface VitaminDCardProps {
    isReadOnly?: boolean;
}

export function VitaminDCard({ isReadOnly = false }: VitaminDCardProps) {
  const { vitaminDRecords, removeVitaminDRecord, getDisplayVitaminDValue, biomarkerUnit, setBiomarkerUnit } = useApp();
   const [, setForceRender] = React.useState(0);

  const sortedRecords = React.useMemo(() => {
    return [...(vitaminDRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vitaminDRecords]);

  const getStatus = (value: number) => {
    // Status based on ng/mL
    if (value < 20) return { text: 'Deficient', variant: 'destructive' as const };
    if (value < 30) return { text: 'Insufficient', variant: 'secondary' as const };
    return { text: 'Sufficient', variant: 'outline' as const };
  };

  const handleSuccess = () => {
    setForceRender(c => c + 1);
  }

  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.value) : null;
  const unitLabel = biomarkerUnit === 'si' ? 'nmol/L' : 'ng/mL';

  const Title = `Vitamin D (${unitLabel})`;
  const Icon = <Sun className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
                <Settings className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
            <AddVitaminDRecordDialog onSuccess={handleSuccess}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Add New Record
                </DropdownMenuItem>
            </AddVitaminDRecordDialog>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Biomarker Units</DropdownMenuLabel>
            <div className="flex items-center justify-center space-x-2 py-2">
                <Label htmlFor="unit-switch-vitd" className="text-xs">ng/mL</Label>
                <Switch
                    id="unit-switch-vitd"
                    checked={biomarkerUnit === 'si'}
                    onCheckedChange={(checked) => setBiomarkerUnit(checked ? 'si' : 'conventional')}
                />
                <Label htmlFor="unit-switch-vitd" className="text-xs">nmol/L</Label>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const formattedRecords = sortedRecords.map(r => ({
      id: r.id,
      date: r.date as string,
      displayValue: `${getDisplayVitaminDValue(r.value)}`
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

  const Chart = <VitaminDChart />;

  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      records={formattedRecords}
      onDeleteRecord={removeVitaminDRecord}
      statusDisplay={StatusDisplay}
      chart={Chart}
      hasRecords={(vitaminDRecords || []).length > 0}
      noRecordsMessage="No Vitamin D records yet."
      statusVariant={currentStatus?.variant}
      isReadOnly={isReadOnly}
    />
  );
}

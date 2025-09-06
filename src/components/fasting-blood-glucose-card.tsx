
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Droplet, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddFastingBloodGlucoseRecordDialog } from './add-fasting-blood-glucose-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { FastingBloodGlucoseChart } from './fasting-blood-glucose-chart';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { BiomarkerCardTemplate } from './biomarker-card-template';

interface FastingBloodGlucoseCardProps {
  isReadOnly?: boolean;
}

export function FastingBloodGlucoseCard({ isReadOnly = false }: FastingBloodGlucoseCardProps) {
  const { fastingBloodGlucoseRecords, removeFastingBloodGlucoseRecord, getDisplayGlucoseValue, biomarkerUnit, setBiomarkerUnit, isDoctorLoggedIn } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = React.useMemo(() => {
    return [...(fastingBloodGlucoseRecords || [])].sort((a,b) => new Date(a.date as string).getTime() - new Date(a.date as string).getTime())
  }, [fastingBloodGlucoseRecords]);
  
  const getStatus = (value: number) => {
    // Status is always checked against the stored mg/dL value
    if (value < 100) return { text: 'Normal', variant: 'outline' as const };
    if (value <= 125) return { text: 'Prediabetes', variant: 'secondary' as const };
    return { text: 'Diabetes', variant: 'destructive' as const };
  }

  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.value) : null;
  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';

  const Title = `Fasting Blood Glucose (${unitLabel})`;
  const Icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = isDoctorLoggedIn ? (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
              </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
             <AddFastingBloodGlucoseRecordDialog>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Add New Record</DropdownMenuItem>
            </AddFastingBloodGlucoseRecordDialog>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Biomarker Units</DropdownMenuLabel>
            <div className="flex items-center justify-center space-x-2 py-2">
                <Label htmlFor="unit-switch-fbg" className="text-xs">mg/dL</Label>
                <Switch
                    id="unit-switch-fbg"
                    checked={biomarkerUnit === 'si'}
                    onCheckedChange={(checked) => setBiomarkerUnit(checked ? 'si' : 'conventional')}
                />
                <Label htmlFor="unit-switch-fbg" className="text-xs">mmol/L</Label>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const RecordsList = (
    <ScrollArea className="h-full max-h-[100px] w-full">
        <ul className="space-y-1 mt-2">
          {sortedRecords.map((record) => {
            const status = getStatus(record.value);
            return (
              <Tooltip key={record.id}>
                <TooltipTrigger asChild>
                  <li className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                    <p className="flex-1">
                      <span className="font-semibold text-foreground">{getDisplayGlucoseValue(record.value)}</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                    </p>
                    <div className="flex items-center shrink-0">
                      {isDoctorLoggedIn && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeFastingBloodGlucoseRecord(record.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete record</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </li>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{status.text}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </ul>
    </ScrollArea>
  );

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

  const Chart = (
    <FastingBloodGlucoseChart />
  );
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
      hasRecords={(fastingBloodGlucoseRecords || []).length > 0}
      statusVariant={currentStatus?.variant}
    />
  );
}

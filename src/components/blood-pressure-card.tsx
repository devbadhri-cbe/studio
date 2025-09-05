
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Heart, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { BloodPressureChart } from './blood-pressure-chart';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { Separator } from './ui/separator';

interface BloodPressureCardProps {
  isReadOnly?: boolean;
}

export function BloodPressureCard({ isReadOnly = false }: BloodPressureCardProps) {
  const { bloodPressureRecords, removeBloodPressureRecord } = useApp();
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const formatDate = useDateFormatter();
  const [, setForceRender] = React.useState(0);

  const sortedRecords = React.useMemo(() => {
    return [...(bloodPressureRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [bloodPressureRecords]);
  
  const getStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return { text: 'Stage 2 HTN', variant: 'destructive' as const };
    if (systolic >= 130 || diastolic >= 80) return { text: 'Stage 1 HTN', variant: 'secondary' as const };
    if (systolic >= 120) return { text: 'Elevated', variant: 'secondary' as const };
    return { text: 'Normal', variant: 'outline' as const };
  }
  
  const handleSuccess = () => {
    setIsActionsOpen(false);
    setForceRender(c => c + 1);
  }

  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.systolic, latestRecord.diastolic) : null;

  const Title = 'Blood Pressure';
  const Icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
    <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
        <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
              </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
            <AddBloodPressureRecordDialog onSuccess={handleSuccess}>
                <Button variant="outline" className="w-full">Add New Record</Button>
            </AddBloodPressureRecordDialog>
        </PopoverContent>
    </Popover>
  ) : null;

  const RecordsList = (
    <ScrollArea className="h-full max-h-[100px] w-full">
        <ul className="space-y-1 mt-2">
          {sortedRecords.map((record) => (
              <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                  <p className="flex-1">
                      <span className="font-semibold text-foreground">{record.systolic}/{record.diastolic}</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                  </p>
                  <div className="flex items-center shrink-0">
                  <Tooltip>
                      <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeBloodPressureRecord(record.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete record</TooltipContent>
                  </Tooltip>
                  </div>
              </li>
            ))}
        </ul>
    </ScrollArea>
  );

  const StatusDisplay = (
    <div className="flex flex-col items-center justify-center flex-1">
      {currentStatus && (
        <div className="text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
                <span>Current Status:</span>
                <Badge variant={currentStatus.variant} className={currentStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>
                {currentStatus.text}
                </Badge>
            </div>
        </div>
      )}
    </div>
  );

  const Chart = <BloodPressureChart />;
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
      className="shadow-xl"
      hasRecords={(bloodPressureRecords || []).length > 0}
      noRecordsMessage="No blood pressure records yet."
    />
  );
}

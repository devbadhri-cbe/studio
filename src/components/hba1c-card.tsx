

'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Droplet, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { AddRecordDialog } from './add-record-dialog';
import { Hba1cChart } from './hba1c-chart';

export function Hba1cCard() {
  const { hba1cRecords, removeHba1cRecord } = useApp();
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const formatDate = useDateFormatter();

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

  const Actions = (
    <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
        <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
              </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
            <AddRecordDialog onSuccess={() => setIsActionsOpen(false)}>
                <Button variant="outline" className="w-full">Add New Record</Button>
            </AddRecordDialog>
        </PopoverContent>
    </Popover>
  );

  const RecordsList = (
    <ScrollArea className="h-[140px] pr-3">
      {sortedRecords.length > 0 ? (
        <ul className="space-y-1 mt-2">
          {sortedRecords.map((record) => (
              <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                  <p className="flex-1">
                      <span className="font-semibold text-foreground">{record.value.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                  </p>
                  <div className="flex items-center shrink-0">
                  <Tooltip>
                      <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeHba1cRecord(record.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete record</TooltipContent>
                  </Tooltip>
                  </div>
              </li>
            ))}
        </ul>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-xs text-muted-foreground text-center">No records.</p>
        </div>
      )}
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

  const Chart = <Hba1cChart />;
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
    />
  );
}


'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Activity, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddThyroidRecordDialog } from './add-thyroid-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ThyroidChart } from './thyroid-chart';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { BiomarkerCardTemplate } from './biomarker-card-template';

export function ThyroidCard() {
  const { thyroidRecords, removeThyroidRecord } = useApp();
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const formatDate = useDateFormatter();
  const [, setForceRender] = React.useState(0);


  const sortedRecords = React.useMemo(() => {
    return [...(thyroidRecords || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [thyroidRecords]);

  const getStatus = (tsh: number) => {
    if (tsh < 0.4) return { text: 'Low (Hyper)', variant: 'secondary' as const };
    if (tsh > 4.0) return { text: 'High (Hypo)', variant: 'destructive' as const };
    return { text: 'Normal', variant: 'outline' as const };
  };
  
  const handleSuccess = () => {
    setIsActionsOpen(false);
    setForceRender(c => c + 1);
  }

  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.tsh) : null;

  const Title = 'Thyroid (TSH)';
  const Icon = <Activity className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = (
    <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <AddThyroidRecordDialog onSuccess={handleSuccess}>
          <Button variant="outline" className="w-full">Add New Record</Button>
        </AddThyroidRecordDialog>
      </PopoverContent>
    </Popover>
  );

  const RecordsList = (
    <ScrollArea className="h-[140px] pr-3">
        <ul className="space-y-1 mt-2">
          {sortedRecords.map((record) => (
            <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
              <p className="flex-1">
                <span className="font-semibold text-foreground">TSH: {record.tsh.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
              </p>
              <div className="flex items-center shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeThyroidRecord(record.id)}>
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
            <span>Current TSH Status:</span>
            <Badge variant={currentStatus.variant} className={currentStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>
              {currentStatus.text}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );

  const Chart = <ThyroidChart />;

  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
      hasRecords={thyroidRecords.length > 0}
    />
  );
}


'use client';

import * as React from 'react';
import { CardContent } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, HeartCrack, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddAnemiaRecordDialog } from './add-anemia-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { AnemiaChart } from './anemia-chart';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { BiomarkerCardTemplate } from './biomarker-card-template';

export function AnemiaCard() {
  const { anemiaRecords, removeAnemiaRecord, profile } = useApp();
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const formatDate = useDateFormatter();

  const sortedRecords = React.useMemo(() => {
    return [...(anemiaRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [anemiaRecords]);
  
  const getStatus = (hemoglobin?: number, gender?: 'male' | 'female' | 'other') => {
    if (hemoglobin === undefined || gender === undefined) return null;

    let isAnemic = false;
    if (gender === 'male' && hemoglobin < 13.5) {
        isAnemic = true;
    } else if (gender === 'female' && hemoglobin < 12.0) {
        isAnemic = true;
    }
    
    return isAnemic 
        ? { text: 'Anemia Present', variant: 'destructive' as const }
        : { text: 'Normal', variant: 'outline' as const };
  }
  
  const latestRecord = sortedRecords[0];
  const currentStatus = getStatus(latestRecord?.hemoglobin, profile.gender);

  const Title = (
    <div className='flex items-center gap-3 flex-1'>
      <HeartCrack className="h-5 w-5 shrink-0 text-muted-foreground" />
      <h3 className="font-medium">Anemia (Hemoglobin)</h3>
    </div>
  );

  const Actions = (
    <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
        <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
              </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                  <AddAnemiaRecordDialog onSuccess={() => setIsActionsOpen(false)}>
                    <Button variant="outline" className="w-full">Add New Record</Button>
                  </AddAnemiaRecordDialog>
              </div>
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
                      <span className="font-semibold text-foreground">{record.hemoglobin.toFixed(1)} g/dL</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                  </p>
                  <div className="flex items-center shrink-0">
                  <Tooltip>
                      <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeAnemiaRecord(record.id)}>
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

  const Chart = (
    <AnemiaChart />
  );
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
    />
  );
}

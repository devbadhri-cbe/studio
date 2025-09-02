
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Droplet } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddFastingBloodGlucoseRecordDialog } from './add-fasting-blood-glucose-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { FastingBloodGlucoseChart } from './fasting-blood-glucose-chart';
import { ScrollArea } from './ui/scroll-area';

export function FastingBloodGlucoseCard() {
  const { fastingBloodGlucoseRecords, removeFastingBloodGlucoseRecord } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = React.useMemo(() => {
    return [...(fastingBloodGlucoseRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [fastingBloodGlucoseRecords]);

  return (
    <Card>
      <CardContent className="space-y-4 text-sm p-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className='flex items-center gap-3 flex-1'>
              <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />
              <h3 className="font-medium">Fasting Blood Glucose</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
               <AddFastingBloodGlucoseRecordDialog />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScrollArea className="h-[140px] pr-3">
              {sortedRecords.length > 0 ? (
                <ul className="space-y-1 mt-2">
                  {sortedRecords.map((record) => {
                    return (
                      <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                        <div className="flex-1">
                          <span className="font-semibold text-foreground">{record.value} mg/dL</span>
                          <span className="block text-xs">on {formatDate(record.date)}</span>
                        </div>
                        <div className="flex items-center shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeFastingBloodGlucoseRecord(record.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete record</TooltipContent>
                          </Tooltip>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-xs text-muted-foreground text-center">No records.</p>
                </div>
              )}
            </ScrollArea>
            <div className="min-h-[150px]">
              <FastingBloodGlucoseChart />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

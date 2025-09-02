
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Droplet, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddFastingBloodGlucoseRecordDialog } from './add-fasting-blood-glucose-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { FastingBloodGlucoseChart } from './fasting-blood-glucose-chart';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export function FastingBloodGlucoseCard() {
  const { fastingBloodGlucoseRecords, removeFastingBloodGlucoseRecord, getDisplayGlucoseValue, biomarkerUnit, setBiomarkerUnit } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = React.useMemo(() => {
    return [...(fastingBloodGlucoseRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [fastingBloodGlucoseRecords]);
  
  const getStatus = (value: number) => {
    // Status is always checked against the stored mg/dL value
    if (value < 100) return { text: 'Normal', variant: 'outline' as const };
    if (value <= 125) return { text: 'Prediabetes', variant: 'secondary' as const };
    return { text: 'Diabetes', variant: 'destructive' as const };
  }

  const latestRecord = sortedRecords.length > 0 ? sortedRecords[0] : null;
  const currentStatus = latestRecord ? getStatus(latestRecord.value) : null;
  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex flex-col flex-1 text-sm p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
            <div className='flex items-center gap-3 flex-1'>
              <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />
              <h3 className="font-medium">Fasting Blood Glucose</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Popover>
                    <PopoverTrigger asChild>
                         <Button size="icon" variant="ghost" className="h-8 w-8">
                             <Settings className="h-4 w-4" />
                         </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64" align="end">
                         <div className="space-y-4">
                             <AddFastingBloodGlucoseRecordDialog>
                                <Button variant="outline" className="w-full">Add New Record</Button>
                             </AddFastingBloodGlucoseRecordDialog>
                             <Separator />
                             <div className="space-y-2">
                                <Label>Biomarker Units</Label>
                                <div className="flex items-center justify-center space-x-2 py-2">
                                    <Label htmlFor="unit-switch-fbg" className="text-xs">mg/dL</Label>
                                    <Switch
                                        id="unit-switch-fbg"
                                        checked={biomarkerUnit === 'si'}
                                        onCheckedChange={(checked) => setBiomarkerUnit(checked ? 'si' : 'conventional')}
                                    />
                                    <Label htmlFor="unit-switch-fbg" className="text-xs">mmol/L</Label>
                                </div>
                            </div>
                         </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
          
        <div className="flex flex-col flex-1 border border-blue-500">
            <div className="flex flex-col md:flex-row border border-green-500">
                <div className="flex flex-col border border-red-500 flex-1">
                  <ScrollArea className="h-[140px] pr-3">
                    {sortedRecords.length > 0 ? (
                      <ul className="space-y-1 mt-2">
                        {sortedRecords.map((record) => {
                          const status = getStatus(record.value);
                          return (
                              <Tooltip key={record.id}>
                                  <TooltipTrigger asChild>
                                      <li className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                                          <div className="flex-1 flex items-center justify-between">
                                              <span className="font-semibold text-foreground">{getDisplayGlucoseValue(record.value)} {unitLabel}</span>
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
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>{status.text}</p>
                                  </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-xs text-muted-foreground text-center">No records.</p>
                        </div>
                      )}
                    </ScrollArea>
                </div>
                {currentStatus && (
                <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 border border-red-500 flex-1">
                    <div className="text-center text-xs text-muted-foreground">
                        <div className="flex flex-col items-center gap-1">
                            <span>Current Status:</span>
                            <Badge variant={currentStatus.variant} className={cn("text-xs", currentStatus.variant === 'outline' ? 'border-green-500 text-green-600' : '')}>
                            {currentStatus.text}
                            </Badge>
                        </div>
                    </div>
                </div>
                )}
            </div>
            <div className="flex flex-col flex-1 min-h-[150px]">
              <FastingBloodGlucoseChart />
            </div>
        </div>

      </CardContent>
    </Card>
  );
}

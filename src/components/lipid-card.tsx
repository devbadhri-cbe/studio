
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Heart, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddLipidRecordDialog } from './add-lipid-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { LdlChart } from './ldl-chart';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { BiomarkerCardTemplate } from './biomarker-card-template';

export function LipidCard() {
  const { lipidRecords, removeLipidRecord, getDisplayLipidValue, biomarkerUnit, setBiomarkerUnit } = useApp();
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const formatDate = useDateFormatter();

  const sortedRecords = React.useMemo(() => {
    return [...lipidRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [lipidRecords]);

  const getStatus = (value: number) => {
    // LDL status based on mg/dL
    if (value < 100) return { text: 'Optimal', variant: 'outline' as const };
    if (value <= 129) return { text: 'Near Optimal', variant: 'default' as const };
    if (value <= 159) return { text: 'Borderline High', variant: 'secondary' as const };
    if (value <= 189) return { text: 'High', variant: 'destructive' as const };
    return { text: 'Very High', variant: 'destructive' as const };
  };

  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord.ldl) : null;
  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';

  const Title = `Lipid Panel (${unitLabel})`;
  const Icon = <Heart className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = (
    <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <AddLipidRecordDialog onSuccess={() => setIsActionsOpen(false)}>
            <Button variant="outline" className="w-full">Add New Record</Button>
          </AddLipidRecordDialog>
          <Separator />
          <div className="space-y-2">
            <Label>Biomarker Units</Label>
            <div className="flex items-center justify-center space-x-2 py-2">
              <Label htmlFor="unit-switch-lipid" className="text-xs">mg/dL</Label>
              <Switch
                id="unit-switch-lipid"
                checked={biomarkerUnit === 'si'}
                onCheckedChange={(checked) => setBiomarkerUnit(checked ? 'si' : 'conventional')}
              />
              <Label htmlFor="unit-switch-lipid" className="text-xs">mmol/L</Label>
            </div>
          </div>
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
                <span className="font-semibold text-foreground">LDL: {getDisplayLipidValue(record.ldl, 'ldl')}</span>
                <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
              </p>
              <div className="flex items-center shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeLipidRecord(record.id)}>
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
            <span>Current LDL Status:</span>
            <Badge variant={currentStatus.variant} className={currentStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>
              {currentStatus.text}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );

  const Chart = <LdlChart />;

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

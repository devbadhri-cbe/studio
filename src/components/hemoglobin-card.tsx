
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Droplet, Settings } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddHemoglobinRecordDialog } from './add-hemoglobin-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { HemoglobinChart } from './hemoglobin-chart';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HemoglobinCardProps {
  isReadOnly?: boolean;
}

export function HemoglobinCard({ isReadOnly = false }: HemoglobinCardProps) {
  const { hemoglobinRecords, removeHemoglobinRecord, profile, biomarkerUnit, setBiomarkerUnit, getDisplayHemoglobinValue } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = React.useMemo(() => {
    return [...(hemoglobinRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [hemoglobinRecords]);
  
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
  const unitLabel = biomarkerUnit === 'si' ? 'g/L' : 'g/dL';

  const Title = `Hemoglobin (${unitLabel})`;
  const Icon = <Droplet className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
              </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
              <AddHemoglobinRecordDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Add New Record</DropdownMenuItem>
              </AddHemoglobinRecordDialog>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Biomarker Units</DropdownMenuLabel>
              <div className="flex items-center justify-center space-x-2 py-2">
                  <Label htmlFor="unit-switch-anemia" className="text-xs">g/dL</Label>
                  <Switch
                      id="unit-switch-anemia"
                      checked={biomarkerUnit === 'si'}
                      onCheckedChange={(checked) => setBiomarkerUnit(checked ? 'si' : 'conventional')}
                  />
                  <Label htmlFor="unit-switch-anemia" className="text-xs">g/L</Label>
              </div>
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const RecordsList = (
    <ScrollArea className="h-full max-h-[100px] w-full">
        <ul className="space-y-1 mt-2">
          {sortedRecords.map((record) => (
              <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                  <p className="flex-1">
                      <span className="font-semibold text-foreground">{getDisplayHemoglobinValue(record.hemoglobin)}</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                  </p>
                  <div className="flex items-center shrink-0">
                  {!isReadOnly && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeHemoglobinRecord(record.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete record</TooltipContent>
                    </Tooltip>
                  )}
                  </div>
              </li>
            ))}
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
      ) : <p>No status</p>}
    </div>
  );

  const Chart = (
    <HemoglobinChart />
  );
  
  return (
    <BiomarkerCardTemplate
      title={Title}
      icon={Icon}
      actions={Actions}
      recordsList={RecordsList}
      statusDisplay={StatusDisplay}
      chart={Chart}
      hasRecords={(hemoglobinRecords || []).length > 0}
      statusVariant={currentStatus?.variant}
    />
  );
}


'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Droplet, Settings } from 'lucide-react';
import { AddHemoglobinRecordDialog } from './add-hemoglobin-record-dialog';
import { HemoglobinChart } from './hemoglobin-chart';
import { Badge } from './ui/badge';
import { BiomarkerCardTemplate } from './biomarker-card-template';
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

  const formattedRecords = sortedRecords.map(r => ({
      id: r.id,
      date: r.date as string,
      displayValue: `${getDisplayHemoglobinValue(r.hemoglobin)}`
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
      records={formattedRecords}
      onDeleteRecord={removeHemoglobinRecord}
      statusDisplay={StatusDisplay}
      chart={Chart}
      hasRecords={(hemoglobinRecords || []).length > 0}
      statusVariant={currentStatus?.variant}
      isReadOnly={isReadOnly}
    />
  );
}

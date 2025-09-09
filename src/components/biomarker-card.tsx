
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Settings, Edit } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface Record {
  id: string;
  date: string | Date;
  [key: string]: any;
}

interface Status {
  text: string;
  variant: 'destructive' | 'secondary' | 'outline' | 'default';
}

interface UnitSwitchProps {
  labelA: string;
  labelB: string;
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  unitSwitchLabel?: string;
}

interface BiomarkerCardProps<T extends Record> {
  title: string;
  icon: React.ReactNode;
  records: T[];
  onRemoveRecord: (id: string) => void;
  getStatus: (record: T) => Status | null;
  formatRecord: (record: T) => { id: string; date: string; displayValue: string };
  addRecordDialog: React.ReactNode;
  chart: React.ReactNode;
  unitSwitch?: UnitSwitchProps;
  isReadOnly?: boolean;
}

export function BiomarkerCard<T extends Record>({
  title,
  icon,
  records,
  onRemoveRecord,
  getStatus,
  formatRecord,
  addRecordDialog,
  chart,
  unitSwitch,
  isReadOnly = false,
}: BiomarkerCardProps<T>) {
  const [isEditMode, setIsEditMode] = React.useState(false);

  const sortedRecords = React.useMemo(() => {
    return [...(records || [])].sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());
  }, [records]);

  const latestRecord = sortedRecords[0];
  const currentStatus = latestRecord ? getStatus(latestRecord) : null;

  const formattedRecords = sortedRecords.map(formatRecord);

  const UnitSwitchComponent = unitSwitch ? (
    <div className="flex items-center justify-center space-x-2 px-2 py-1">
        <Label htmlFor={`unit-switch-${title}`} className="text-xs">{unitSwitch.labelA}</Label>
        <Switch
            id={`unit-switch-${title}`}
            checked={unitSwitch.isChecked}
            onCheckedChange={unitSwitch.onCheckedChange}
            onSelect={(e) => e.preventDefault()}
        />
        <Label htmlFor={`unit-switch-${title}`} className="text-xs">{unitSwitch.labelB}</Label>
    </div>
  ) : null;

  const Actions = !isReadOnly ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            {React.cloneElement(addRecordDialog as React.ReactElement, {
                children: <div className="w-full">Add New Record</div>
            })}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setIsEditMode((prev) => !prev)} disabled={sortedRecords.length === 0}>
          <Edit className="mr-2 h-4 w-4" />
          {isEditMode ? 'Done Editing' : 'Edit Records'}
        </DropdownMenuItem>
        {UnitSwitchComponent && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{unitSwitch.unitSwitchLabel || 'Biomarker Units'}</DropdownMenuLabel>
            <div onClick={(e) => e.stopPropagation()}>
                {UnitSwitchComponent}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const StatusDisplay = (
    <div className="text-center text-xs text-muted-foreground flex items-center justify-center h-full">
      {currentStatus ? (
        <div className="flex flex-col items-center gap-1">
          <span>Current Status:</span>
          <Badge variant={currentStatus.variant} className={currentStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}>
            {currentStatus.text}
          </Badge>
        </div>
      ) : (
        <p>No status</p>
      )}
    </div>
  );

  return (
    <BiomarkerCardTemplate
      title={title}
      icon={icon}
      actions={Actions}
      records={formattedRecords}
      onDeleteRecord={onRemoveRecord}
      statusDisplay={StatusDisplay}
      chart={chart}
      hasRecords={(records || []).length > 0}
      statusVariant={currentStatus?.variant}
      isReadOnly={isReadOnly}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
    />
  );
}

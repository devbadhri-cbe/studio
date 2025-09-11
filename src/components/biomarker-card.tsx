
'use client';

import * as React from 'react';
import { Settings, Edit, PlusCircle } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { ActionMenu } from './ui/action-menu';

interface Record {
  id: string;
  date: string | Date;
  [key: string]: any;
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
  getStatus: (record?: T) => { text: string; variant: 'destructive' | 'secondary' | 'outline' | 'default' } | React.ReactNode | null;
  formatRecord: (record: T) => { id: string; date: string; displayValue: string };
  addRecordDialog: React.ReactNode;
  chart: React.ReactNode;
  unitSwitch?: UnitSwitchProps;
  isReadOnly?: boolean;
  editMenuItems?: React.ReactNode;
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
  editMenuItems,
}: BiomarkerCardProps<T>) {
  const [isEditMode, setIsEditMode] = React.useState(false);

  const sortedRecords = React.useMemo(() => {
    return [...(records || [])].sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime());
  }, [records]);

  const latestRecord = sortedRecords[0];
  const statusResult = getStatus(latestRecord);

  let statusContent: React.ReactNode = null;
  if (statusResult) {
      if (React.isValidElement(statusResult)) {
          statusContent = statusResult;
      } else if (typeof statusResult === 'object' && 'text' in statusResult && 'variant' in statusResult) {
          const { text, variant } = statusResult;
          statusContent = <Badge variant={variant} className={cn(variant === 'outline' && 'border-green-500 text-green-600')}>{text}</Badge>;
      }
  }


  const formattedRecords = sortedRecords.map(formatRecord);

  const Actions = !isReadOnly ? (
    <ActionMenu tooltip="Settings" icon={<Settings className="h-4 w-4" />} onClick={(e) => e.stopPropagation()}>
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        {React.cloneElement(addRecordDialog as React.ReactElement, {
          children: (
             <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span>Add New Record</span>
             </div>
          )
        })}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setIsEditMode((prev) => !prev)} disabled={sortedRecords.length === 0}>
        <Edit className="mr-2 h-4 w-4" />
        {isEditMode ? 'Done Editing' : 'Edit Records'}
      </DropdownMenuItem>
      {editMenuItems}
      {unitSwitch && (
        <>
          <DropdownMenuSeparator />
           {unitSwitch.unitSwitchLabel && <DropdownMenuLabel>{unitSwitch.unitSwitchLabel}</DropdownMenuLabel>}
          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center space-x-2 px-2 py-1">
              <Label htmlFor={`unit-switch-${title}`} className="text-xs">{unitSwitch.labelA}</Label>
              <Switch
                  id={`unit-switch-${title}`}
                  checked={unitSwitch.isChecked}
                  onCheckedChange={unitSwitch.onCheckedChange}
              />
              <Label htmlFor={`unit-switch-${title}`} className="text-xs">{unitSwitch.labelB}</Label>
          </div>
        </>
      )}
    </ActionMenu>
  ) : null;

  const StatusDisplay = (
    <div className="text-center text-xs text-muted-foreground flex items-center justify-center h-full w-full">
      {statusContent}
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
      isReadOnly={isReadOnly}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
    />
  );
}

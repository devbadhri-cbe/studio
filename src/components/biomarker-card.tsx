
'use client';

import * as React from 'react';
import { Settings, Edit, PlusCircle } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { ActionMenu } from './ui/action-menu';
import { UniversalCard } from './universal-card';
import { ScrollArea } from './ui/scroll-area';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { CardDescription, CardTitle } from './ui/card';

interface Record {
  id: string;
  date: string | Date;
  [key: string]: any;
}

interface FormattedRecord {
  id: string;
  date: string;
  displayValue: string;
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
  formatRecord: (record: T) => FormattedRecord;
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
  const [isAdding, setIsAdding] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const formatDate = useDateFormatter();

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
  const hasRecords = records && records.length > 0;

  const handleAddRecordCancel = () => setIsAdding(false);
  
  const addRecordForm = React.cloneElement(addRecordDialog as React.ReactElement, {
      onCancel: handleAddRecordCancel,
  });

  const Actions = !isReadOnly ? (
    <ActionMenu 
      tooltip="Settings" 
      icon={<Settings className="h-4 w-4" />} 
      open={isMenuOpen}
      onOpenChange={setIsMenuOpen}
    >
      <DropdownMenuItem onSelect={() => setIsAdding(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add New Record
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

  const RecordsList = (
    <ScrollArea className="h-[150px] w-full">
        <ul className="space-y-1 mt-2">
          {formattedRecords.map((record) => (
              <li key={record.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                  <p className="flex-1">
                      <span className="font-semibold text-foreground">{record.displayValue}</span>
                      <span className="text-xs text-muted-foreground"> on {formatDate(record.date)}</span>
                  </p>
                  <div className="flex items-center shrink-0">
                  {isEditMode && !isReadOnly && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => onRemoveRecord(record.id)}>
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

  if (isAdding) {
    return addRecordForm;
  }
  
  const headerContent = (
      <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {icon}
          </div>
          <div>
              <CardTitle>{title}</CardTitle>
          </div>
      </div>
  );

  return (
    <UniversalCard
      headerContent={headerContent}
      actions={Actions}
      contentClassName="p-0"
    >
       {hasRecords ? (
          <div className="flex flex-col flex-1 h-full p-6 pt-0">
            <div className="flex flex-row items-center gap-4 border border-red-500">
                <div className="flex-1 pr-2 border border-green-500">{RecordsList}</div>
                <div className="pl-2 border border-yellow-500 flex flex-col justify-center items-center">
                    {statusContent}
                </div>
            </div>

            <Separator className="my-4" />
            
            <div className="flex-1 flex w-full p-2 min-h-[200px] border border-red-500">
                {chart}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4 min-h-[200px]">
              <p className="text-sm">No records yet.</p>
              {!isReadOnly && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAdding(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add First Record
                </Button>
              )}
          </div>
        )}
    </UniversalCard>
  );
}

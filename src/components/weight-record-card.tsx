
'use client';

import * as React from 'react';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { Trash2, Weight, Settings, Edit } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddWeightRecordDialog } from './add-weight-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { kgToLbs, getBmiStatus, BMI_CATEGORIES, cmToFtIn } from '@/lib/utils';
import { WeightChart } from './weight-chart';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import type { EditHeightDialogHandles } from './edit-height-dialog';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface WeightRecordCardProps {
    isReadOnly?: boolean;
}

export function WeightRecordCard({ isReadOnly = false }: WeightRecordCardProps) {
  const { weightRecords, removeWeightRecord, profile, setProfile } = useApp();
  const formatDate = useDateFormatter();
  const isImperial = profile.unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const editHeightDialogRef = React.useRef<EditHeightDialogHandles>(null);
  const [, setForceRender] = React.useState(0);

  const sortedWeights = React.useMemo(() => {
    return [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [weightRecords]);
  
  const bmiStatus = getBmiStatus(profile.bmi);

  let heightDisplay = 'N/A';
  if (profile.height) {
    if (isImperial) {
        const { feet, inches } = cmToFtIn(profile.height);
        heightDisplay = `${feet}' ${inches}"`;
    } else {
        heightDisplay = `${profile.height} cm`;
    }
  }

  const handleSuccess = () => {
    setForceRender(c => c + 1);
  }

  const Title = `Weight & BMI (${weightUnit})`;
  const Icon = <Weight className="h-5 w-5 shrink-0 text-muted-foreground" />;

  const Actions = !isReadOnly ? (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
                <Settings className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
            <AddWeightRecordDialog onSuccess={handleSuccess}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Add New Record
                </DropdownMenuItem>
            </AddWeightRecordDialog>
            <DropdownMenuItem onSelect={() => editHeightDialogRef.current?.open()}>
                <Edit className="mr-2 h-4 w-4"/>
                Edit Height
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Unit System</DropdownMenuLabel>
            <div className="flex items-center justify-center space-x-2 py-2">
                <Label htmlFor="unit-switch-weight" className="text-xs">kg</Label>
                <Switch
                    id="unit-switch-weight"
                    checked={isImperial}
                    onCheckedChange={(checked) => setProfile({...profile, unitSystem: checked ? 'imperial' : 'metric'})}
                />
                <Label htmlFor="unit-switch-weight" className="text-xs">lbs</Label>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  const RecordsList = (
     <ScrollArea className="h-full max-h-[100px] w-full">
        {sortedWeights.length > 0 ? (
            <ul className="space-y-1 mt-2">
            {sortedWeights.map((weight) => {
                const displayWeight = isImperial
                ? `${kgToLbs(weight.value).toFixed(1)} lbs`
                : `${weight.value.toFixed(1)} kg`;

                return (
                <li key={weight.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                    <p className="flex-1">
                    <span className="font-semibold text-foreground">{displayWeight}</span>
                    <span className="text-xs text-muted-foreground"> on {formatDate(weight.date)}</span>
                    </p>
                    <div className="flex items-center shrink-0">
                    {!isReadOnly && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeWeightRecord(weight.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete record</TooltipContent>
                        </Tooltip>
                    )}
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
  );

  const StatusDisplay = (
    <div className="flex flex-col items-center justify-center flex-1 gap-2 text-sm text-muted-foreground text-center h-full">
        <span>Height: <span className="font-bold text-foreground">{heightDisplay}</span></span>
        {bmiStatus ? (
            <div className="flex flex-col items-center gap-1">
                <span>Current BMI: <span className="font-bold text-foreground">{profile.bmi?.toFixed(1)}</span></span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Badge variant={bmiStatus.variant} className={`cursor-pointer ${bmiStatus.variant === 'outline' ? 'border-green-500 text-green-600' : ''}`}>
                            {bmiStatus.text}
                        </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 text-sm">
                    <div className="space-y-1 text-left">
                        <h4 className="font-bold">BMI Categories</h4>
                        {BMI_CATEGORIES.map(category => (
                        <p key={category.text}>
                            {category.min === 40 ? '≥ 40' : (category.max === 18.4 ? `< 18.5` : `${category.min} - ${category.max}`)}: {category.text}
                        </p>
                        ))}
                    </div>
                    </PopoverContent>
                </Popover>
            </div>
        ) : <p>No status</p>}
    </div>
  );

  const Chart = <WeightChart />;

  return (
    <BiomarkerCardTemplate
        title={Title}
        icon={Icon}
        actions={Actions}
        recordsList={RecordsList}
        statusDisplay={StatusDisplay}
        chart={Chart}
        className="shadow-xl"
        hasRecords={(weightRecords || []).length > 0}
        noRecordsMessage="No weight records yet."
        statusVariant={bmiStatus?.variant}
    />
  );
}

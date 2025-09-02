
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import type { EditHeightDialogHandles } from './edit-height-dialog';
import { Card, CardContent } from './ui/card';

export function WeightRecordCard() {
  const { weightRecords, removeWeightRecord, profile, setProfile } = useApp();
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const formatDate = useDateFormatter();
  const isImperial = profile.unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';
  const editHeightDialogRef = React.useRef<EditHeightDialogHandles>(null);

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

  return (
    <Card className="w-full h-full flex flex-col border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col h-full text-sm p-0 space-y-4">
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-3 flex-1'>
                    <Weight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <h3 className="font-medium">Weight Records ({weightUnit})</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Popover open={isActionsOpen} onOpenChange={setIsActionsOpen}>
                        <PopoverTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="end">
                            <div className="space-y-4">
                                <AddWeightRecordDialog onSuccess={() => setIsActionsOpen(false)}>
                                    <Button variant="outline" className="w-full">Add New Record</Button>
                                </AddWeightRecordDialog>
                                <Button variant="outline" className="w-full" onClick={() => editHeightDialogRef.current?.open()}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    Edit Height
                                </Button>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Unit System</Label>
                                    <div className="flex items-center justify-center space-x-2 py-2">
                                        <Label htmlFor="unit-switch-weight" className="text-xs">kg</Label>
                                        <Switch
                                            id="unit-switch-weight"
                                            checked={isImperial}
                                            onCheckedChange={(checked) => setProfile({...profile, unitSystem: checked ? 'imperial' : 'metric'})}
                                        />
                                        <Label htmlFor="unit-switch-weight" className="text-xs">lbs</Label>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="border rounded-md p-2 min-h-[140px]">
                    <ScrollArea className="h-[124px] pr-3">
                    {sortedWeights.length > 0 ? (
                        <ul className="space-y-1 mt-2">
                        {sortedWeights.slice(0, 5).map((weight) => {
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
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeWeightRecord(weight.id)}>
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
                </div>
                
                <div className="border rounded-md p-2 flex items-center justify-center min-h-[140px]">
                     <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground text-center">
                        <span>Height: <span className="font-bold text-foreground">{heightDisplay}</span></span>
                        {bmiStatus && (
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
                        )}
                    </div>
                </div>
            </div>
            
            <Separator />

            <div className="flex-1 flex flex-col min-h-[150px]">
                <WeightChart />
            </div>
        </CardContent>
    </Card>
  );
}

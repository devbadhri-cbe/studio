
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Button } from './ui/button';
import { PlusCircle, Trash2, TrendingUp } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddWeightRecordDialog } from './add-weight-record-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { kgToLbs } from '@/lib/utils';
import { WeightChart } from './weight-chart';
import { Separator } from './ui/separator';

export function WeightRecordCard() {
  const { weightRecords, removeWeightRecord, profile } = useApp();
  const formatDate = useDateFormatter();
  const isImperial = profile.unitSystem === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  const sortedWeights = React.useMemo(() => {
    return [...(weightRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [weightRecords]);
  
  const idealWeight = React.useMemo(() => {
      if (!profile.height) return null;
      const heightInMeters = profile.height / 100;
      const idealWeightInKg = 25 * (heightInMeters * heightInMeters);
      const value = isImperial ? kgToLbs(idealWeightInKg) : idealWeightInKg;
      return parseFloat(value.toFixed(1));
  }, [profile.height, isImperial]);

  return (
    <Card>
      <CardContent className="space-y-4 text-sm p-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className='flex items-center gap-3 flex-1'>
              <TrendingUp className="h-5 w-5 shrink-0 text-muted-foreground" />
              <h3 className="font-medium">Weight Records</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <AddWeightRecordDialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" className="h-8 w-8">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add Weight Record</p>
                  </TooltipContent>
                </Tooltip>
              </AddWeightRecordDialog>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {sortedWeights.length > 0 ? (
                <ul className="space-y-1 mt-2">
                  {sortedWeights.slice(0, 5).map((weight) => {
                    const displayWeight = isImperial
                      ? `${kgToLbs(weight.value).toFixed(1)} lbs`
                      : `${weight.value.toFixed(1)} kg`;

                    return (
                      <li key={weight.id} className="group flex items-center gap-2 text-xs text-muted-foreground border-l-2 border-primary pl-3 pr-2 py-1 hover:bg-muted/50 rounded-r-md">
                        <div className="flex-1">
                          <span className="font-semibold text-foreground">{displayWeight}</span>
                          <span className="block text-xs">on {formatDate(weight.date)}</span>
                        </div>
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
                <p className="text-xs text-muted-foreground pl-8 h-full flex items-center justify-center">No weight recorded.</p>
              )}
            </div>
            <div className="min-h-[150px]">
              <WeightChart />
            </div>
          </div>
          {(idealWeight || profile.bmi) && (
             <div className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-4">
                {profile.bmi && (
                    <div>Current BMI: <span className="font-bold text-foreground">{profile.bmi.toFixed(1)}</span></div>
                )}
                {idealWeight && profile.bmi && <Separator orientation="vertical" className="h-4" />}
                {idealWeight && (
                    <div>Ideal Weight: <span className="font-bold text-foreground">{idealWeight} {weightUnit}</span></div>
                )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';
import { BloodPressureChart } from './blood-pressure-chart';
import { BloodPressureHistoryTable } from './blood-pressure-history-table';


export function HypertensionCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>Blood Pressure Trend</CardTitle>
          <CardDescription>Visualize your blood pressure over time.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddBloodPressureRecordDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 px-2 md:px-6">
        <BloodPressureChart />
        <BloodPressureHistoryTable />
      </CardContent>
    </Card>
  );
}

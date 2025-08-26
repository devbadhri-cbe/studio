
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddThyroidRecordDialog } from './add-thyroid-record-dialog';
import { ThyroidChart } from './thyroid-chart';
import { ThyroidHistoryTable } from './thyroid-history-table';

export function ThyroidCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>Thyroid (TSH) Trend</CardTitle>
          <CardDescription>Visualize your TSH levels over time.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddThyroidRecordDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 px-2 md:px-6">
        <ThyroidChart />
        <ThyroidHistoryTable />
      </CardContent>
    </Card>
  );
}

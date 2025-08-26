
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddVitaminDRecordDialog } from './add-vitamin-d-record-dialog';
import { VitaminDChart } from './vitamin-d-chart';
import { VitaminDHistoryTable } from './vitamin-d-history-table';

export function VitaminDCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>Vitamin D Trend</CardTitle>
          <CardDescription>Visualize your Vitamin D levels over time.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddVitaminDRecordDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 px-2 md:px-6">
        <VitaminDChart />
        <VitaminDHistoryTable />
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddRecordDialog } from './add-record-dialog';
import { UploadRecordDialog } from './upload-record-dialog';
import { Hba1cChart } from './hba1c-chart';
import { HistoryTable } from './history-table';

export function Hba1cCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>HbA1c Trend</CardTitle>
          <CardDescription>Visualize your HbA1c levels over time.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddRecordDialog />
          <UploadRecordDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 px-2 md:px-6">
        <Hba1cChart />
        <HistoryTable />
      </CardContent>
    </Card>
  );
}

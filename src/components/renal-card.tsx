
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddRenalRecordDialog } from './add-renal-record-dialog';
import { RenalChart } from './renal-chart';
import { RenalHistoryTable } from './renal-history-table';

export function RenalCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>Renal Function Trend</CardTitle>
          <CardDescription>Visualize your eGFR and UACR levels over time.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddRenalRecordDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 px-2 md:px-6">
        <RenalChart />
        <RenalHistoryTable />
      </CardContent>
    </Card>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddLipidRecordDialog } from './add-lipid-record-dialog';
import { LdlChart } from './ldl-chart';
import { LipidHistoryTable } from './lipid-history-table';

export function LipidCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>LDL Cholesterol Trend</CardTitle>
          <CardDescription>Visualize your LDL levels over time.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddLipidRecordDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 px-2 md:px-6">
        <LdlChart />
        <LipidHistoryTable />
      </CardContent>
    </Card>
  );
}

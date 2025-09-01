
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddRenalRecordDialog } from './add-renal-record-dialog';
import { RenalChart } from './renal-chart';
import { RenalHistoryTable } from './renal-history-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BloodPressureChart } from './blood-pressure-chart';
import { BloodPressureHistoryTable } from './blood-pressure-history-table';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';

export function RenalCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>Renal & Blood Pressure Dashboard</CardTitle>
          <CardDescription>Monitor key indicators for kidney health and associated blood pressure.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddRenalRecordDialog />
          <AddBloodPressureRecordDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 px-2 md:px-6">
        <Tabs defaultValue="renal">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="renal">Renal Function</TabsTrigger>
            <TabsTrigger value="bp">Blood Pressure</TabsTrigger>
          </TabsList>
          <TabsContent value="renal" className="mt-6">
             <div className="grid gap-6">
                <RenalChart />
                <RenalHistoryTable />
             </div>
          </TabsContent>
          <TabsContent value="bp" className="mt-6">
            <div className="grid gap-6">
              <BloodPressureChart />
              <BloodPressureHistoryTable />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

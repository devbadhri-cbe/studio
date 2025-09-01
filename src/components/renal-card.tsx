
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddRenalRecordDialog } from './add-renal-record-dialog';
import { RenalChart } from './renal-chart';
import { RenalHistoryTable } from './renal-history-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BloodPressureChart } from './blood-pressure-chart';
import { BloodPressureHistoryTable } from './blood-pressure-history-table';
import { AddBloodPressureRecordDialog } from './add-blood-pressure-record-dialog';
import { ElectrolytesChart } from './electrolytes-chart';
import { ElectrolytesHistoryTable } from './electrolytes-history-table';
import { AddElectrolyteRecordDialog } from './add-electrolyte-record-dialog';
import { Separator } from './ui/separator';
import { AnemiaCard } from './anemia-card';
import { NutritionCard } from './nutrition-card';

export function RenalCard() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start">
        <div className="grid gap-2">
          <CardTitle>CKD Monitoring Dashboard</CardTitle>
          <CardDescription>Comprehensive monitoring for Chronic Kidney Disease based on clinical guidelines.</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddRenalRecordDialog />
          <AddBloodPressureRecordDialog />
          <AddElectrolyteRecordDialog />
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 px-2 md:px-6">
        <Tabs defaultValue="core">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="core">Core Tests</TabsTrigger>
            <TabsTrigger value="electrolytes">Electrolytes</TabsTrigger>
            <TabsTrigger value="bone-anemia">Bone, Anemia &amp; Nutrition</TabsTrigger>
          </TabsList>
          <TabsContent value="core" className="mt-6">
             <div className="grid gap-6">
                <RenalChart />
                <RenalHistoryTable />
                <Separator />
                <h3 className="text-md font-semibold text-center text-muted-foreground">Associated Blood Pressure</h3>
                <BloodPressureChart />
                <BloodPressureHistoryTable />
             </div>
          </TabsContent>
          <TabsContent value="electrolytes" className="mt-6">
            <div className="grid gap-6">
              <ElectrolytesChart />
              <ElectrolytesHistoryTable />
            </div>
          </TabsContent>
           <TabsContent value="bone-anemia" className="mt-6">
            <div className="grid gap-6">
              <AnemiaCard />
              <Separator />
              <NutritionCard />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

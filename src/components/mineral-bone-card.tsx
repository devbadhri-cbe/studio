
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-context';
import { Bone } from 'lucide-react';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { MineralBoneChart } from './mineral-bone-chart';
import { MineralBoneHistoryTable } from './mineral-bone-history-table';

export function MineralBoneCard() {
  const { mineralBoneDiseaseRecords } = useApp();
  const formatDate = useDateFormatter();
  const lastRecord = [...(mineralBoneDiseaseRecords || [])].sort((a,b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bone className="h-5 w-5 text-gray-500" />
          <CardTitle>Mineral & Bone Disease</CardTitle>
        </div>
        <CardDescription>
          Monitoring Calcium, Phosphorus, and Parathyroid Hormone (PTH) is crucial in managing CKD-MBD.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastRecord ? (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md border bg-muted/50 p-2">
                <p className="font-semibold">Calcium</p>
                <p className="text-lg font-bold">{lastRecord.calcium.toFixed(1)}</p>
                <p className="text-muted-foreground">mg/dL</p>
            </div>
             <div className="rounded-md border bg-muted/50 p-2">
                <p className="font-semibold">Phosphorus</p>
                <p className="text-lg font-bold">{lastRecord.phosphorus.toFixed(1)}</p>
                <p className="text-muted-foreground">mg/dL</p>
            </div>
             <div className="rounded-md border bg-muted/50 p-2">
                <p className="font-semibold">PTH</p>
                <p className="text-lg font-bold">{lastRecord.pth}</p>
                <p className="text-muted-foreground">pg/mL</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">No mineral & bone data available.</p>
        )}
        <div className="h-[300px] w-full pt-4">
            <MineralBoneChart />
        </div>
         <MineralBoneHistoryTable />
      </CardContent>
    </Card>
  );
}

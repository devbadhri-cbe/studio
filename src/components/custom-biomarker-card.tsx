
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { Settings, Edit, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BiomarkerCardTemplate } from './biomarker-card-template';
import type { CustomBiomarker } from '@/lib/types';
import { useApp } from '@/context/app-context';
import { AddCustomRecordDialog } from './add-custom-record-dialog';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Line, LineChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot } from 'recharts';
import { format, parseISO } from 'date-fns';

interface CustomBiomarkerCardProps {
  biomarker: CustomBiomarker;
}

export function CustomBiomarkerCard({ biomarker }: CustomBiomarkerCardProps) {
  const { removeCustomBiomarker, removeCustomBiomarkerRecord } = useApp();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = React.useState(false);
  const formatDate = useDateFormatter();

  const sortedRecords = React.useMemo(() => {
    return [...(biomarker.records || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [biomarker.records]);

  const formattedRecords = sortedRecords.map(record => ({
    id: record.id,
    date: record.date,
    displayValue: `${record.value} ${record.unit || ''}`.trim(),
  }));

  const Chart = () => {
    const formatShortDate = (tickItem: string) => format(parseISO(tickItem), "MMM d");

    return (
        <div className="h-full w-full flex flex-col">
            <ResponsiveContainer width="100%" height="100%">
            {sortedRecords.length > 0 ? (
                <LineChart data={sortedRecords} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tickLine={true} axisLine={true} tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={true} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} dx={-5} />
                <Tooltip
                    cursor={<Rectangle fill="hsl(var(--muted))" opacity="0.5" />}
                    content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                        return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                                <span className="font-bold text-foreground">{formatDate(label)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">{biomarker.name}</span>
                                <span className="font-bold" style={{ color: 'hsl(var(--chart-1))' }}>
                                {payload[0].value} {payload[0].payload.unit || ''}
                                </span>
                            </div>
                            </div>
                        </div>
                        );
                    }
                    return null;
                    }}
                />
                <Line type="monotone" dataKey="value" name={biomarker.name} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--chart-1))" />} activeDot={{ r: 6 }} />
                </LineChart>
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                <p className="text-center text-xs text-muted-foreground">Not enough data to display chart.</p>
                </div>
            )}
            </ResponsiveContainer>
        </div>
    )
  }

  const Actions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuItem onSelect={() => setIsAddRecordOpen(true)}>Add New Record</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setIsEditMode((prev) => !prev)} disabled={sortedRecords.length === 0}>
          <Edit className="mr-2 h-4 w-4" />
          {isEditMode ? 'Done Editing' : 'Edit Records'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => removeCustomBiomarker(biomarker.id)} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Biomarker
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
    <BiomarkerCardTemplate
      title={biomarker.name}
      description={biomarker.description}
      icon={<div className="h-5 w-5 shrink-0 bg-primary rounded-full" />}
      actions={Actions}
      records={formattedRecords}
      onDeleteRecord={(recordId) => removeCustomBiomarkerRecord(biomarker.id, recordId)}
      statusDisplay={<Badge variant="outline">Custom</Badge>}
      chart={<Chart />}
      hasRecords={(biomarker.records || []).length > 0}
      statusVariant="default"
      isReadOnly={false}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
    />
    <AddCustomRecordDialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen} biomarker={biomarker} />
    </>
  );
}


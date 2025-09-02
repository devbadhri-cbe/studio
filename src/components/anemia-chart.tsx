
'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot, ReferenceArea, Label, ReferenceLine } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { format, parseISO } from 'date-fns';

export function AnemiaChart() {
  const { anemiaRecords, profile } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = [...(anemiaRecords || [])].sort((a,b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
  
  const latestRecords = sortedRecords.slice(-5);
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    value: r.hemoglobin,
  }));
  
  const yAxisDomain = React.useMemo(() => {
    if (chartData.length === 0) return [5, 20];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values, 18);
    const padding = (max - min) * 0.2;
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [chartData]);
  
  const formatShortDate = (tickItem: string) => {
    return format(parseISO(tickItem), "MMM d");
  }
  
  const normalRange = profile.gender === 'male' ? { low: 13.5, high: 17.5 } : { low: 12.0, high: 15.5 };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {anemiaRecords && anemiaRecords.length > 0 ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tickLine={true}
                axisLine={true}
                angle={-45}
                textAnchor="end"
                height={50}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                domain={yAxisDomain}
                allowDecimals={true}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                dx={-5}
              />
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
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Hemoglobin</span>
                            <span className="font-bold" style={{ color: 'hsl(var(--chart-1))' }}>
                              {payload[0].value} g/dL
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
                <ReferenceArea y1={normalRange.low} y2={normalRange.high} fill="hsl(var(--accent))" strokeOpacity={0.3} fillOpacity={0.1}>
                   <Label value="Normal" position="insideTopLeft" fill="hsl(var(--accent))" fontSize={10} />
                </ReferenceArea>
                 <ReferenceLine y={normalRange.low} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />

              <Line type="monotone" dataKey="value" name="Hemoglobin" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--chart-1))" />} activeDot={{ r: 6 }} />
            </LineChart>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
              <p className="text-center text-xs text-muted-foreground">Not enough data to display chart.</p>
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

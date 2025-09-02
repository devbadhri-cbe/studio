
'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';

export function FastingBloodGlucoseChart() {
  const { fastingBloodGlucoseRecords } = useApp();
  const formatDate = useDateFormatter();
  const unitLabel = 'mg/dL';

  const sortedRecords = [...(fastingBloodGlucoseRecords || [])].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const latestRecords = sortedRecords.slice(-10);
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    value: r.value,
  }));

  const yAxisDomain = React.useMemo(() => {
    if (chartData.length === 0) return [50, 150];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.2;
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [chartData]);
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {fastingBloodGlucoseRecords && fastingBloodGlucoseRecords.length > 0 ? (
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => formatDate(tick)}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                dy={10}
              />
              <YAxis
                domain={yAxisDomain}
                allowDecimals={false}
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
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Glucose</span>
                            <span className="font-bold" style={{ color: 'hsl(var(--chart-1))' }}>
                              {payload[0].value} {unitLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="value" name="Glucose" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--chart-1))" />} activeDot={{ r: 6 }} />
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

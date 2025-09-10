
'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot, ReferenceArea, Label } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { format, parseISO } from 'date-fns';

export function ThyroxineChart() {
  const { thyroxineRecords } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = [...(thyroxineRecords || [])].sort((a,b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
  
  const latestRecords = sortedRecords.slice(-10);
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    value: r.value,
  }));
  
  const yAxisDomain = React.useMemo(() => {
    const defaultMin = 2;
    const defaultMax = 16;
    if (chartData.length === 0) return [defaultMin, defaultMax];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values, 12);
    const padding = (max - min) * 0.2;
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [chartData]);
  
  const formatShortDate = (tickItem: string) => {
    return format(parseISO(tickItem), "MMM d");
  }

  const normalMin = 4.5;
  const normalMax = 11.7;

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {thyroxineRecords && thyroxineRecords.length > 0 ? (
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tickLine={true}
                axisLine={true}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                domain={yAxisDomain}
                allowDecimals
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
                            <span className="text-[0.70rem] uppercase text-muted-foreground">T4</span>
                            <span className="font-bold" style={{ color: 'hsl(var(--chart-4))' }}>
                              {payload[0].value} ng/dL
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
                <ReferenceArea y1={normalMin} y2={normalMax} fill="hsl(var(--accent))" strokeOpacity={0.3} fillOpacity={0.1}>
                   <Label value="Normal" position="insideTopRight" fill="hsl(var(--accent))" fontSize={10} />
                </ReferenceArea>

              <Line type="monotone" dataKey="value" name="Thyroxine (T4)" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--chart-4))" />} activeDot={{ r: 6 }} />
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

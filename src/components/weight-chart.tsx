
'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { kgToLbs } from '@/lib/utils';

export function WeightChart() {
  const { weightRecords, profile } = useApp();
  const formatDate = useDateFormatter();
  const isImperial = profile.unitSystem === 'imperial';
  const unitLabel = isImperial ? 'lbs' : 'kg';

  const sortedRecords = [...(weightRecords || [])].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const latestRecords = sortedRecords.slice(-10);
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    value: isImperial ? parseFloat(kgToLbs(r.value).toFixed(1)) : parseFloat(r.value.toFixed(1)),
  }));

  const yAxisDomain = React.useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.2;
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [chartData]);
  
  const idealWeight = React.useMemo(() => {
      if (!profile.height) return null;
      const heightInMeters = profile.height / 100;
      const idealWeightInKg = 25 * (heightInMeters * heightInMeters);
      const value = isImperial ? kgToLbs(idealWeightInKg) : idealWeightInKg;
      return parseFloat(value.toFixed(1));
  }, [profile.height, isImperial]);


  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {weightRecords && weightRecords.length > 0 ? (
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
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
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Weight</span>
                            <span className="font-bold" style={{ color: 'hsl(var(--chart-5))' }}>
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
              <Line type="monotone" dataKey="value" name="Weight" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--chart-5))" />} activeDot={{ r: 6 }} />
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

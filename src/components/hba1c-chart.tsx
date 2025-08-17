'use client';

import { format } from 'date-fns';
import { Area, AreaChart, CartesianGrid, Legend, Rectangle, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const chartConfig = {
  hba1c: {
    label: 'HbA1c (%)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function Hba1cChart() {
  const { records } = useApp();

  const chartData = records.map((r) => ({
    date: r.date,
    hba1c: r.value,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {records.length > 0 ? (
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorHba1c" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
              tickLine={false}
              axisLine={false}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              domain={([dataMin, dataMax]) => {
                const min = Math.min(3, dataMin);
                const max = Math.max(10, dataMax);
                return [min, max];
              }}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
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
                          <span className="font-bold text-foreground">{format(new Date(label), 'PPP')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">HbA1c</span>
                          <span className="font-bold" style={{ color: 'hsl(var(--primary))' }}>
                            {payload[0].value}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceArea y1={4.0} y2={5.6} stroke="hsl(var(--accent))" strokeOpacity={0.3} fill="hsl(var(--accent))" fillOpacity={0.1}>
              <Legend
                content={() => (
                  <div className="text-xs text-center text-accent-foreground/70" style={{color: 'hsl(var(--accent))'}}>
                    Healthy Range (4.0-5.6%)
                  </div>
                )}
                verticalAlign="top"
                align="center"
              />
            </ReferenceArea>
            <Area type="monotone" dataKey="hba1c" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorHba1c)" />
          </AreaChart>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-center text-muted-foreground">No data to display.</p>
            <p className="text-center text-sm text-muted-foreground">Add a record to see your chart.</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}

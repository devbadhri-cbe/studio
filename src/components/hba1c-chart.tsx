'use client';

import { format } from 'date-fns';
import { Line, LineChart, CartesianGrid, Label, Legend, Rectangle, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { useApp } from '@/context/app-context';

const chartConfig = {
  hba1c: {
    label: 'HbA1c (%)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function Hba1cChart() {
  const { records } = useApp();

  const sortedRecords = [...records].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestRecords = sortedRecords.slice(0, 5).reverse();
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    hba1c: r.value,
  }));

  const maxValue = chartData.reduce((max, r) => r.hba1c > max ? r.hba1c : max, 0);
  const yAxisMax = Math.ceil(maxValue / 2) * 2 + 2;
  const yAxisTicks = Array.from({ length: yAxisMax / 2 }, (_, i) => (i + 1) * 2);


  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {records.length > 0 ? (
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => format(new Date(tick), 'dd-MM-yyyy')}
              tickLine={true}
              axisLine={true}
              padding={{ left: 20, right: 20 }}
              angle={-60}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[2, yAxisMax]}
              ticks={yAxisTicks}
              allowDecimals={false}
              tickLine={true}
              axisLine={true}
              label={{ value: '%', angle: -90, position: 'insideLeft' }}
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
                          <span className="font-bold text-foreground">{format(new Date(label), 'dd-MM-yyyy')}</span>
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
            <ReferenceArea y1={4.0} y2={5.6} stroke="hsl(var(--accent))" strokeOpacity={0.3} fill="transparent" fillOpacity={0}>
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
             <ReferenceLine y={5.7} stroke="hsl(var(--destructive))" strokeOpacity={0.5} strokeDasharray="3 3">
              <Label value="Prediabetes (5.7%)" position="top" fill="hsl(var(--destructive))" fontSize={10} />
            </ReferenceLine>
            <ReferenceLine y={6.5} stroke="hsl(var(--destructive))" strokeOpacity={0.8} strokeDasharray="3 3">
              <Label value="Diabetes (6.5%)" position="top" fill="hsl(var(--destructive))" fontSize={10} />
            </ReferenceLine>
            <Line type="monotone" dataKey="hba1c" stroke="hsl(var(--primary))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--primary))" />} activeDot={{ r: 6 }} />
          </LineChart>
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

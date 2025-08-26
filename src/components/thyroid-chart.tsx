
'use client';

import { format } from 'date-fns';
import { Line, LineChart, CartesianGrid, Label, Legend, Rectangle, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot } from 'recharts';
import { useApp } from '@/context/app-context';

export function ThyroidChart() {
  const { thyroidRecords } = useApp();

  const sortedRecords = [...(thyroidRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestRecords = sortedRecords.slice(0, 5).reverse();
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    tsh: r.tsh,
  }));

  const maxValue = chartData.reduce((max, r) => r.tsh > max ? r.tsh : max, 0);
  const yAxisMax = Math.max(10, Math.ceil(maxValue / 2) * 2 + 2);
  const yAxisTicks = Array.from({ length: Math.floor(yAxisMax / 2) }, (_, i) => (i + 1) * 2);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {thyroidRecords && thyroidRecords.length > 0 ? (
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
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
              domain={[0, yAxisMax]}
              ticks={yAxisTicks}
              allowDecimals={true}
              tickLine={true}
              axisLine={true}
              label={{ value: 'μIU/mL', angle: -90, position: 'insideLeft' }}
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
                          <span className="text-[0.70rem] uppercase text-muted-foreground">TSH</span>
                          <span className="font-bold" style={{ color: 'hsl(var(--chart-4))' }}>
                            {payload[0].value} μIU/mL
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceArea y1={0.4} y2={4.0} stroke="hsl(var(--accent))" strokeOpacity={0.3} fill="transparent" fillOpacity={0}>
              <Legend
                content={() => (
                  <div className="text-xs text-center text-accent-foreground/70" style={{color: 'hsl(var(--accent))'}}>
                    Normal Range (0.4-4.0 μIU/mL)
                  </div>
                )}
                verticalAlign="top"
                align="center"
              />
            </ReferenceArea>
            <Line type="monotone" dataKey="tsh" name="TSH" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--chart-4))" />} activeDot={{ r: 6 }} />
          </LineChart>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-center text-muted-foreground">No data to display.</p>
            <p className="text-center text-sm text-muted-foreground">Add a thyroid record to see your chart.</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}

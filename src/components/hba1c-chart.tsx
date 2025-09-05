
'use client';

import { Line, LineChart, CartesianGrid, Label, Legend, Rectangle, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { format, parseISO } from 'date-fns';

export function Hba1cChart() {
  const { hba1cRecords } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = [...(hba1cRecords || [])].sort((a,b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime());
  const latestRecords = sortedRecords.slice(Math.max(sortedRecords.length - 5, 0));
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    hba1c: r.value,
  }));

  const maxValue = chartData.reduce((max, r) => r.hba1c > max ? r.hba1c : max, 0);
  const yAxisMax = Math.ceil(maxValue / 2) * 2 + 2;
  const yAxisTicks = Array.from({ length: yAxisMax / 2 }, (_, i) => (i + 1) * 2);

   const formatShortDate = (tickItem: string) => {
    return format(parseISO(tickItem), "MMM d");
  }


  return (
    <div className="h-full w-full flex flex-col">
       <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            {hba1cRecords && hba1cRecords.length > 0 ? (
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
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
                  domain={[2, yAxisMax]}
                  ticks={yAxisTicks}
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
                <ReferenceArea y1={0} y2={5.6} fill="hsl(var(--accent))" strokeOpacity={0.3} fillOpacity={0.1}>
                   <Label value="Healthy" position="insideTopLeft" fill="hsl(var(--accent))" fontSize={10} />
                </ReferenceArea>
                <ReferenceArea y1={5.7} y2={6.4} fill="hsl(var(--chart-3))" strokeOpacity={0.3} fillOpacity={0.1}>
                   <Label value="Prediabetes" position="insideTopLeft" fill="hsl(var(--chart-3))" fontSize={10} />
                </ReferenceArea>
                <ReferenceArea y1={6.5} y2={yAxisMax} fill="hsl(var(--destructive))" strokeOpacity={0.3} fillOpacity={0.1}>
                  <Label value="Diabetes" position="insideTopLeft" fill="hsl(var(--destructive))" fontSize={10} />
                </ReferenceArea>

                <Line type="monotone" dataKey="hba1c" stroke="hsl(var(--primary))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--primary))" />} activeDot={{ r: 6 }} />
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

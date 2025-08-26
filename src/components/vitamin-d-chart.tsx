
'use client';

import { format } from 'date-fns';
import { Line, LineChart, CartesianGrid, Label, Legend, Rectangle, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot } from 'recharts';
import { useApp } from '@/context/app-context';

export function VitaminDChart() {
  const { vitaminDRecords } = useApp();

  const sortedRecords = [...(vitaminDRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestRecords = sortedRecords.slice(0, 5).reverse();
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    value: r.value,
  }));

  const maxValue = chartData.reduce((max, r) => r.value > max ? r.value : max, 0);
  const yAxisMax = Math.max(100, Math.ceil(maxValue / 20) * 20 + 20);
  const yAxisTicks = Array.from({ length: Math.floor(yAxisMax / 20) }, (_, i) => (i + 1) * 20);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {vitaminDRecords && vitaminDRecords.length > 0 ? (
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
              allowDecimals={false}
              tickLine={true}
              axisLine={true}
              label={{ value: 'ng/mL', angle: -90, position: 'insideLeft' }}
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
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Vitamin D</span>
                          <span className="font-bold" style={{ color: 'hsl(var(--chart-2))' }}>
                            {payload[0].value} ng/mL
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceArea y1={30} y2={100} stroke="hsl(var(--accent))" strokeOpacity={0.3} fill="transparent" fillOpacity={0}>
              <Legend
                content={() => (
                  <div className="text-xs text-center text-accent-foreground/70" style={{color: 'hsl(var(--accent))'}}>
                    Sufficient Range (30-100 ng/mL)
                  </div>
                )}
                verticalAlign="top"
                align="center"
              />
            </ReferenceArea>
             <ReferenceArea y1={20} y2={29} stroke="hsl(var(--chart-3))" strokeOpacity={0.3} fill="hsl(var(--chart-3))" fillOpacity={0.1}>
                 <Label value="Insufficient" position="insideTopLeft" fill="hsl(var(--chart-3))" fontSize={10} />
            </ReferenceArea>
             <ReferenceArea y1={0} y2={19} stroke="hsl(var(--destructive))" strokeOpacity={0.3} fill="hsl(var(--destructive))" fillOpacity={0.1}>
                 <Label value="Deficient" position="insideTopLeft" fill="hsl(var(--destructive))" fontSize={10} />
            </ReferenceArea>
            <Line type="monotone" dataKey="value" name="Vitamin D" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--chart-2))" />} activeDot={{ r: 6 }} />
          </LineChart>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-center text-muted-foreground">No data to display.</p>
            <p className="text-center text-sm text-muted-foreground">Add a Vitamin D record to see your chart.</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}

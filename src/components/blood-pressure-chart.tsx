
'use client';

import { format } from 'date-fns';
import { ComposedChart, Area, Line, CartesianGrid, Label, Rectangle, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '@/context/app-context';

export function BloodPressureChart() {
  const { bloodPressureRecords } = useApp();

  const sortedRecords = [...(bloodPressureRecords || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestRecords = sortedRecords.slice(0, 5).reverse();
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    bp: [r.systolic, r.diastolic],
  }));

  const yAxisMax = 200;
  const yAxisTicks = Array.from({ length: Math.floor(yAxisMax / 20) }, (_, i) => (i + 1) * 20);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {bloodPressureRecords && bloodPressureRecords.length > 0 ? (
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
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
              domain={[40, yAxisMax]}
              ticks={yAxisTicks}
              allowDecimals={false}
              tickLine={true}
              axisLine={true}
              label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={<Rectangle fill="hsl(var(--muted))" opacity="0.5" />}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const bpValue = payload[0].value as [number, number];
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                          <span className="font-bold text-foreground">{format(new Date(label), 'dd-MM-yyyy')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">BP</span>
                          <span className="font-bold" style={{ color: 'hsl(var(--chart-5))' }}>
                            {bpValue[0]} / {bpValue[1]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Reference Areas for BP Categories */}
            <ReferenceArea y1={0} y2={80} x1={0} x2={120} stroke="hsl(var(--accent))" strokeOpacity={0.3} fill="hsl(var(--accent))" fillOpacity={0.1}>
              <Label value="Normal" position="insideTopLeft" fill="hsl(var(--accent))" fontSize={10} />
            </ReferenceArea>
             <ReferenceArea y1={0} y2={80} x1={120} x2={130} stroke="hsl(var(--chart-2))" strokeOpacity={0.3} fill="hsl(var(--chart-2))" fillOpacity={0.1}>
              <Label value="Elevated" position="insideTopLeft" fill="hsl(var(--chart-2))" fontSize={10} />
            </ReferenceArea>
             <ReferenceArea y1={80} y2={90} x1={130} x2={140} stroke="hsl(var(--chart-3))" strokeOpacity={0.3} fill="hsl(var(--chart-3))" fillOpacity={0.1}>
              <Label value="Stage 1" position="insideTopLeft" fill="hsl(var(--chart-3))" fontSize={10} />
            </ReferenceArea>
             <ReferenceArea y1={90} y2={yAxisMax} x1={140} x2={yAxisMax} stroke="hsl(var(--destructive))" strokeOpacity={0.3} fill="hsl(var(--destructive))" fillOpacity={0.1}>
              <Label value="Stage 2" position="insideTopLeft" fill="hsl(var(--destructive))" fontSize={10} />
            </ReferenceArea>

            <Area type="monotone" dataKey="bp" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} />
            <Line type="monotone" dataKey={(v) => v.bp[0]} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="Systolic"/>
            <Line type="monotone" dataKey={(v) => v.bp[1]} stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--accent))' }} activeDot={{ r: 6 }} name="Diastolic"/>
          </ComposedChart>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-center text-muted-foreground">No data to display.</p>
            <p className="text-center text-sm text-muted-foreground">Add a blood pressure record to see your chart.</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}

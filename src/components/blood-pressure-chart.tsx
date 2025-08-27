
'use client';

import { format, subYears } from 'date-fns';
import { ComposedChart, Area, Line, CartesianGrid, Label, Rectangle, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { useApp } from '@/context/app-context';

export function BloodPressureChart() {
  const { bloodPressureRecords } = useApp();

  const sortedRecords = [...(bloodPressureRecords || [])].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const oneYearAgo = subYears(new Date(), 1);
  
  let latestRecords = sortedRecords.filter(r => new Date(r.date) >= oneYearAgo);

  if (latestRecords.length < 5 && sortedRecords.length >= 5) {
      latestRecords = sortedRecords.slice(sortedRecords.length - 5);
  } else if (sortedRecords.length < 5) {
      latestRecords = sortedRecords;
  }
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    systolic: r.systolic,
    diastolic: r.diastolic,
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
              dataKey="systolic"
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
                  const systolicValue = payload.find(p => p.dataKey === 'systolic')?.value;
                  const diastolicValue = payload.find(p => p.dataKey === 'diastolic')?.value;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
                          <span className="font-bold text-foreground">{format(new Date(label), 'dd-MM-yyyy')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">BP</span>
                           <span className="font-bold">
                            <span style={{ color: 'hsl(var(--primary))' }}>{systolicValue}</span>
                            <span className="text-muted-foreground"> / </span>
                            <span style={{ color: 'hsl(var(--accent))' }}>{diastolicValue}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
             <ReferenceArea y1={80} y2={130} fill="hsl(var(--accent))" strokeOpacity={0.3} fillOpacity={0.1}>
            </ReferenceArea>

            <ReferenceLine y={80} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
            <ReferenceLine y={130} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
            
            <Line type="monotone" dataKey='systolic' stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="Systolic"/>
            <Line type="monotone" dataKey='diastolic' stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--accent))' }} activeDot={{ r: 6 }} name="Diastolic"/>
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

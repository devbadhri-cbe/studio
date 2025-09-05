
'use client';

import { format, subYears, parseISO } from 'date-fns';
import { ComposedChart, Area, Line, CartesianGrid, Label, Rectangle, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';

export function BloodPressureChart() {
  const { bloodPressureRecords } = useApp();
  const formatDate = useDateFormatter();

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
    heartRate: r.heartRate,
  }));

  const yAxisMax = 200;
  const yAxisTicks = Array.from({ length: Math.floor(yAxisMax / 20) }, (_, i) => (i + 1) * 20);
  
  const formatShortDate = (tickItem: string) => {
    return format(parseISO(tickItem), "MMM d");
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {bloodPressureRecords && bloodPressureRecords.length > 0 ? (
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
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
              yAxisId="left"
              dataKey="systolic"
              domain={[40, yAxisMax]}
              ticks={yAxisTicks}
              allowDecimals={false}
              tickLine={true}
              axisLine={true}
              label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
                yAxisId="right" 
                dataKey="heartRate" 
                orientation="right" 
                domain={[40, 120]} 
                tickLine={true} 
                axisLine={true} 
                label={{ value: 'bpm', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              cursor={<Rectangle fill="hsl(var(--muted))" opacity="0.5" />}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const systolicValue = payload.find(p => p.dataKey === 'systolic')?.value;
                  const diastolicValue = payload.find(p => p.dataKey === 'diastolic')?.value;
                  const heartRateValue = payload.find(p => p.dataKey === 'heartRate')?.value;

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-1 gap-1 text-center">
                        <div className="font-bold text-foreground">{formatDate(label)}</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">BP</span>
                            <span className="font-bold">
                                <span style={{ color: 'hsl(var(--primary))' }}>{systolicValue}</span>
                                <span className="text-muted-foreground"> / </span>
                                <span style={{ color: 'hsl(var(--accent))' }}>{diastolicValue}</span>
                            </span>
                            </div>
                             <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">HR</span>
                                <span className="font-bold" style={{ color: 'hsl(var(--chart-3))' }}>
                                    {heartRateValue || 'N/A'}
                                </span>
                            </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
             <ReferenceArea yAxisId="left" y1={80} y2={130} fill="hsl(var(--accent))" strokeOpacity={0.3} fillOpacity={0.1}>
            </ReferenceArea>

            <ReferenceLine yAxisId="left" y={80} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
            <ReferenceLine yAxisId="left" y={130} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
            
            <Line yAxisId="left" type="monotone" dataKey='systolic' stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="Systolic"/>
            <Line yAxisId="left" type="monotone" dataKey='diastolic' stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--accent))' }} activeDot={{ r: 6 }} name="Diastolic"/>
            <Line yAxisId="right" type="monotone" dataKey='heartRate' stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-3))' }} activeDot={{ r: 6 }} name="Heart Rate"/>

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

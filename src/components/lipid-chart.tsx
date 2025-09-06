
'use client';

import { format, parseISO } from 'date-fns';
import { ComposedChart, Area, Line, CartesianGrid, Label, Rectangle, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';

export function LipidChart() {
  const { lipidRecords } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = [...(lipidRecords || [])].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const chartData = sortedRecords.slice(-10).map((r) => ({
    date: r.date,
    ldl: r.ldl,
    hdl: r.hdl,
    triglycerides: r.triglycerides,
  }));

  const yAxisMax = 250;
  const yAxisTicks = Array.from({ length: Math.floor(yAxisMax / 50) }, (_, i) => (i + 1) * 50);
  
  const formatShortDate = (tickItem: string) => {
    return format(parseISO(tickItem), "MMM d");
  }

  return (
    <div className="h-full w-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        {lipidRecords && lipidRecords.length > 0 ? (
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tickLine={true}
              axisLine={true}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              dataKey="ldl"
              domain={[0, yAxisMax]}
              ticks={yAxisTicks}
              allowDecimals={false}
              tickLine={true}
              axisLine={true}
              label={{ value: 'mg/dL', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={<Rectangle fill="hsl(var(--muted))" opacity="0.5" />}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const ldl = payload.find(p => p.dataKey === 'ldl')?.value;
                  const hdl = payload.find(p => p.dataKey === 'hdl')?.value;
                  const trig = payload.find(p => p.dataKey === 'triglycerides')?.value;

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                      <div className="font-bold text-foreground mb-1">{formatDate(label)}</div>
                      <div className="grid grid-cols-1 gap-1">
                        <div className="flex justify-between">
                            <span style={{ color: 'hsl(var(--chart-1))' }}>LDL:</span>
                            <span className="font-bold">{ldl}</span>
                        </div>
                        <div className="flex justify-between">
                             <span style={{ color: 'hsl(var(--chart-2))' }}>HDL:</span>
                            <span className="font-bold">{hdl}</span>
                        </div>
                        <div className="flex justify-between">
                             <span style={{ color: 'hsl(var(--chart-3))' }}>Triglycerides:</span>
                            <span className="font-bold">{trig}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
             <ReferenceLine y={100} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
             <ReferenceLine y={150} stroke="hsl(var(--chart-3))" strokeDasharray="3 3" />
             <ReferenceLine y={40} stroke="hsl(var(--chart-2))" strokeDasharray="3 3" />
            
            <Line type="monotone" dataKey='ldl' stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-1))' }} activeDot={{ r: 6 }} name="LDL"/>
            <Line type="monotone" dataKey='hdl' stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-2))' }} activeDot={{ r: 6 }} name="HDL"/>
            <Line type="monotone" dataKey='triglycerides' stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-3))' }} activeDot={{ r: 6 }} name="Triglycerides"/>

          </ComposedChart>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-center text-muted-foreground">No data to display.</p>
            <p className="text-center text-sm text-muted-foreground">Add a lipid panel record to see your chart.</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}

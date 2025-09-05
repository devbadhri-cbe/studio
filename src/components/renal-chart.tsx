
'use client';

import { ComposedChart, Area, Line, CartesianGrid, Label, Rectangle, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { format, subYears, parseISO } from 'date-fns';

export function RenalChart() {
  const { renalRecords } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = [...(renalRecords || [])].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const oneYearAgo = subYears(new Date(), 1);
  
  let latestRecords = sortedRecords.filter(r => new Date(r.date) >= oneYearAgo);

  if (latestRecords.length < 5 && sortedRecords.length >= 5) {
      latestRecords = sortedRecords.slice(sortedRecords.length - 5);
  } else if (latestRecords.length < 5) {
      latestRecords = sortedRecords;
  }
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    egfr: r.eGFR,
    uacr: r.uacr,
  }));

  const yAxisMaxEgfr = 150;
  const yAxisMaxUacr = 300;

  const formatShortDate = (tickItem: string) => {
    return format(parseISO(tickItem), "MMM d");
  }

  return (
    <div className="h-full w-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        {renalRecords && renalRecords.length > 0 ? (
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 40, left: 0 }}>
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
              dataKey="egfr"
              domain={[0, yAxisMaxEgfr]}
              allowDecimals={false}
              tickLine={true}
              axisLine={true}
              label={{ value: 'eGFR', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
                yAxisId="right" 
                dataKey="uacr" 
                orientation="right" 
                domain={[0, yAxisMaxUacr]} 
                tickLine={true} 
                axisLine={true} 
                label={{ value: 'UACR (mg/g)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              cursor={<Rectangle fill="hsl(var(--muted))" opacity="0.5" />}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const egfrValue = payload.find(p => p.dataKey === 'egfr')?.value;
                  const uacrValue = payload.find(p => p.dataKey === 'uacr')?.value;

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-1 gap-1 text-center">
                        <div className="font-bold text-foreground">{formatDate(label)}</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">eGFR</span>
                            <span className="font-bold" style={{ color: 'hsl(var(--chart-1))' }}>{egfrValue}</span>
                            </div>
                             <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">UACR</span>
                                <span className="font-bold" style={{ color: 'hsl(var(--chart-2))' }}>
                                    {uacrValue || 'N/A'}
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
             <ReferenceArea yAxisId="left" y1={90} y2={yAxisMaxEgfr} fill="hsl(var(--accent))" strokeOpacity={0.3} fillOpacity={0.1}>
                 <Label value="Normal eGFR" position="insideTopLeft" fill="hsl(var(--accent))" fontSize={10} />
             </ReferenceArea>
             <ReferenceLine yAxisId="left" y={60} stroke="hsl(var(--destructive))" strokeDasharray="3 3">
                <Label value="CKD Threshold" position="top" fill="hsl(var(--destructive))" fontSize={10} dy={-5}/>
             </ReferenceLine>
             <ReferenceLine yAxisId="right" y={30} stroke="hsl(var(--destructive))" strokeDasharray="3 3">
                 <Label value="Albuminuria" position="top" fill="hsl(var(--destructive))" fontSize={10} dy={-5}/>
             </ReferenceLine>
            
            <Line yAxisId="left" type="monotone" dataKey='egfr' stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-1))' }} activeDot={{ r: 6 }} name="eGFR"/>
            <Line yAxisId="right" type="monotone" dataKey='uacr' stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-2))' }} activeDot={{ r: 6 }} name="UACR"/>

          </ComposedChart>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-center text-muted-foreground">No data to display.</p>
            <p className="text-center text-sm text-muted-foreground">Add a renal record to see your chart.</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}


'use client';

import { ComposedChart, Line, CartesianGrid, Label, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { format, subYears, parseISO } from 'date-fns';

export function ElectrolytesChart() {
  const { electrolyteRecords } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = [...(electrolyteRecords || [])].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const oneYearAgo = subYears(new Date(), 1);
  
  let latestRecords = sortedRecords.filter(r => new Date(r.date) >= oneYearAgo);

  if (latestRecords.length < 5 && sortedRecords.length >= 5) {
      latestRecords = sortedRecords.slice(sortedRecords.length - 5);
  } else if (latestRecords.length < 5) {
      latestRecords = sortedRecords;
  }
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    sodium: r.sodium,
    potassium: r.potassium,
    chloride: r.chloride,
    bicarbonate: r.bicarbonate,
  }));
  
  const yAxisDomain = [
      Math.min(...chartData.map(d => d.potassium), 0),
      Math.max(...chartData.map(d => d.sodium), 150)
  ]

  const formatShortDate = (tickItem: string) => {
    return format(parseISO(tickItem), "MMM d");
  }


  return (
    <div className="h-[300px] w-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        {electrolyteRecords && electrolyteRecords.length > 0 ? (
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
              dataKey="sodium"
              domain={yAxisDomain}
              allowDecimals={false}
              tickLine={true}
              axisLine={true}
              label={{ value: 'mEq/L', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={<Rectangle fill="hsl(var(--muted))" opacity="0.5" />}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-bold text-foreground mb-2 text-center">{formatDate(label)}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          {payload.map(p => (
                            <div key={p.dataKey} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></div>
                                <span className="capitalize text-muted-foreground">{p.name}:</span>
                                <span className="font-bold">{p.value}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line type="monotone" dataKey='sodium' stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-1))' }} activeDot={{ r: 6 }} name="Sodium"/>
            <Line type="monotone" dataKey='potassium' stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-2))' }} activeDot={{ r: 6 }} name="Potassium"/>
            <Line type="monotone" dataKey='chloride' stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-3))' }} activeDot={{ r: 6 }} name="Chloride"/>
            <Line type="monotone" dataKey='bicarbonate' stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-4))' }} activeDot={{ r: 6 }} name="Bicarbonate"/>

          </ComposedChart>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-center text-muted-foreground">No data to display.</p>
            <p className="text-center text-sm text-muted-foreground">Add an electrolyte record to see your chart.</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}

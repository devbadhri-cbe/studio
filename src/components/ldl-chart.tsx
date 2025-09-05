
'use client';

import { Line, LineChart, CartesianGrid, Label, Legend, Rectangle, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Dot } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { useApp } from '@/context/app-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';

export function LdlChart() {
  const { lipidRecords, getDisplayLipidValue, biomarkerUnit } = useApp();
  const formatDate = useDateFormatter();

  const sortedRecords = [...lipidRecords].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestRecords = sortedRecords.slice(-5);
  
  const chartData = latestRecords.map((r) => ({
    date: r.date,
    ldl: getDisplayLipidValue(r.ldl, 'ldl'),
  }));

  const maxValue = chartData.reduce((max, r) => r.ldl > max ? r.ldl : max, 0);
  
  // Dynamic Y-axis based on unit
  const yAxisMax = biomarkerUnit === 'si' ? Math.ceil(maxValue) + 2 : Math.ceil(maxValue / 50) * 50 + 50;
  const yAxisTickInterval = biomarkerUnit === 'si' ? 1 : 50;
  const yAxisTicks = Array.from({ length: Math.floor(yAxisMax / yAxisTickInterval) }, (_, i) => (i + 1) * yAxisTickInterval);
  const unitLabel = biomarkerUnit === 'si' ? 'mmol/L' : 'mg/dL';
  
  // Reference lines in correct units
  const nearOptimal = biomarkerUnit === 'si' ? getDisplayLipidValue(100, 'ldl') : 100;
  const idealTarget = biomarkerUnit === 'si' ? getDisplayLipidValue(70, 'ldl') : 70;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {lipidRecords.length > 0 ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => formatDate(tick)}
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
              allowDecimals={biomarkerUnit === 'si'}
              tickLine={true}
              axisLine={true}
              label={{ value: unitLabel, angle: -90, position: 'insideLeft' }}
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
                          <span className="text-[0.70rem] uppercase text-muted-foreground">LDL</span>
                          <span className="font-bold" style={{ color: 'hsl(var(--primary))' }}>
                            {payload[0].value} {unitLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceArea y1={0} y2={nearOptimal} stroke="hsl(var(--accent))" strokeOpacity={0.3} fill="transparent" fillOpacity={0}>
              <Legend
                content={() => (
                  <div className="text-xs text-center text-accent-foreground/70" style={{color: 'hsl(var(--accent))'}}>
                    Near Optimal Range (&lt;{nearOptimal} {unitLabel})
                  </div>
                )}
                verticalAlign="top"
                align="center"
              />
            </ReferenceArea>
            <ReferenceLine y={idealTarget} stroke="hsl(var(--destructive))" strokeDasharray="3 3">
              <Label value={`Ideal Target (<${idealTarget} ${unitLabel})`} position="insideTopLeft" fill="hsl(var(--destructive))" fontSize={10} />
            </ReferenceLine>
            <Line type="monotone" dataKey="ldl" name="LDL" stroke="hsl(var(--primary))" strokeWidth={2} dot={<Dot r={4} fill="hsl(var(--primary))" />} activeDot={{ r: 6 }} />
          </LineChart>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-center text-muted-foreground">No data to display.</p>
            <p className="text-center text-sm text-muted-foreground">Add a lipid record to see your chart.</p>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}

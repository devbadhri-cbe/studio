import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FC } from 'react';

interface UricAcidChartProps {
  records: { value: number; date: string }[];
}

const UricAcidChart: FC<UricAcidChartProps> = ({ records }) => {
  const data = records.map((record) => ({ ...record, date: new Date(record.date) }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow">
          <p className="label">{label.toLocaleDateString()}</p>
          <p>
            Value: {payload[0].value} mg/dl
          </p>
        </div>
      );
    } else return null;
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      {records.length === 0 ? (
        <p className="text-center text-gray-400">No data available.</p>
      ) : (
        <LineChart
          width={500}
          height={250}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" type="number" tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()} domain={['auto', 'auto']} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default UricAcidChart;
import { AddRecordDialogLayout } from '@/components/add-record-dialog-layout';
import { useApp } from '@/context/app-context';
import { DatePicker } from '@/components/date-picker';
import { Input } from '@/components/input';
import { z } from 'zod';
import { useState } from 'react';

const schema = z.object({ value: z.number().positive(), date: z.date() });

const AddUricAcidRecordDialog: React.FC<{ addRecord: (value: number, date: string) => void }> = ({ addRecord }) => {
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const result = schema.safeParse({ value: parseFloat(value), date });

    if (result.success) {
      addRecord(result.data.value, result.data.date.toISOString());
      setValue('');
      setDate('');
      setError('');
    } else {
      setError('Invalid input');
    }
  };

  return (
    <AddRecordDialogLayout onSubmit={handleSubmit} error={error}>
      <DatePicker value={date} onChange={setDate} label="Date" />
      <Input value={value} onChange={(e) => setValue(e.target.value)} type="number" label="Value" />
    </AddRecordDialogLayout>
  );
};

export default AddUricAcidRecordDialog; 
'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { DatePicker } from './ui/date-picker';

interface DateInputProps {
  name: string;
  label: string;
  fromYear?: number;
  toYear?: number;
}

export function DateInput({ name, label, fromYear, toYear }: DateInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              fromYear={fromYear}
              toYear={toYear}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

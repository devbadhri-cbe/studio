
'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface DateFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
}

export function DateField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  ...datePickerProps
}: DateFieldProps<TFieldValues>) {
  return (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem className="flex flex-col">
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
                <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    {...datePickerProps}
                />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
    />
  );
}

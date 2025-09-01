
"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { Input } from "./input";

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
}: DatePickerProps) {
  const [dateString, setDateString] = React.useState('');

  React.useEffect(() => {
    if (value) {
      try {
        setDateString(format(value, 'yyyy-MM-dd'));
      } catch (e) {
        setDateString('');
      }
    } else {
      setDateString('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newString = e.target.value;
    setDateString(newString);
    try {
      // The HTML input type="date" provides the date in 'yyyy-MM-dd' format.
      // We parse it while accounting for the user's timezone to avoid off-by-one errors.
      const parsedDate = parse(newString, 'yyyy-MM-dd', new Date());
      if (!isNaN(parsedDate.getTime())) {
          onChange(parsedDate);
      } else {
        // Handle cases where the input might be cleared or invalid
        onChange(undefined);
      }
    } catch {
       onChange(undefined);
    }
  };

  return (
    <Input
        type="date"
        value={dateString}
        onChange={handleInputChange}
        placeholder={placeholder || "YYYY-MM-DD"}
        className="w-full justify-start text-left font-normal h-10"
    />
  )
}

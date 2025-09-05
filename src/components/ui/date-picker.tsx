
"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
}

const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
];

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const isMobile = useIsMobile();

  const [day, setDay] = React.useState<string>(value ? format(value, 'dd') : '');
  const [month, setMonth] = React.useState<string>(value ? format(value, 'MM') : '');
  const [year, setYear] = React.useState<string>(value ? format(value, 'yyyy') : '');

  React.useEffect(() => {
    if (value) {
      setDay(format(value, 'dd'));
      setMonth(format(value, 'MM'));
      setYear(format(value, 'yyyy'));
    } else {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);
  
  React.useEffect(() => {
    const dayInt = parseInt(day, 10);
    const monthInt = parseInt(month, 10);
    const yearInt = parseInt(year, 10);

    if (dayInt > 0 && monthInt > 0 && year.length === 4) {
      const dateStr = `${year}-${month}-${day}`;
      const newDate = parse(dateStr, 'yyyy-MM-dd', new Date());
      if (isValid(newDate)) {
        onChange(newDate);
      }
    }
  }, [day, month, year, onChange]);

  if (isMobile) {
    const handleMobileDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
        if (isValid(date)) {
            onChange(date);
        } else {
            onChange(undefined);
        }
    };
    
    return (
        <Input
            type="date"
            value={value ? format(value, 'yyyy-MM-dd') : ''}
            onChange={handleMobileDateChange}
            className={cn(
                "w-full justify-start text-left font-normal h-10",
                !value && "text-muted-foreground"
            )}
        />
    )
  }

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 border border-input rounded-md px-3 h-10 w-full">
         <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
         <Input 
            placeholder="DD"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-10 border-0 p-0 shadow-none focus-visible:ring-0 text-center"
            maxLength={2}
         />
         <span className="text-muted-foreground">/</span>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0 h-auto w-24 focus-visible:ring-0">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m.value} value={(m.value + 1).toString().padStart(2, '0')}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">/</span>
         <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0 h-auto w-20 focus-visible:ring-0">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}



"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"

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
  label?: string;
}

const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
];

export function DatePicker({
  value,
  onChange,
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const isMobile = useIsMobile();

  const [day, setDay] = React.useState<string>(value && isValid(value) ? format(value, 'dd') : '');
  const [month, setMonth] = React.useState<string>(value && isValid(value) ? String(value.getMonth()) : '');
  const [year, setYear] = React.useState<string>(value && isValid(value) ? format(value, 'yyyy') : '');

  React.useEffect(() => {
    if (value && isValid(value)) {
      setDay(format(value, 'dd'));
      setMonth(String(value.getMonth()));
      setYear(format(value, 'yyyy'));
    } else {
        // If the initial value is cleared or invalid, reset fields
        setDay('');
        setMonth('');
        setYear('');
    }
  }, [value]);
  
  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
     if (newDay && newMonth && newYear.length === 4) {
      const dayInt = parseInt(newDay, 10);
      const monthInt = parseInt(newMonth, 10);
      const yearInt = parseInt(newYear, 10);
      
      const newDate = new Date(yearInt, monthInt, dayInt);

      if (isValid(newDate) && newDate.getFullYear() === yearInt && newDate.getMonth() === monthInt && newDate.getDate() === dayInt) {
        onChange(newDate);
      } else {
        onChange(undefined);
      }
    } else {
      onChange(undefined);
    }
  }
  
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = e.target.value;
    setDay(newDay);
    updateDate(newDay, month, year);
  }
  
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    updateDate(day, newMonth, year);
  }

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    updateDate(day, month, newYear);
  }

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
        <div>
            <Input
                type="date"
                value={value && isValid(value) ? format(value, 'yyyy-MM-dd') : ''}
                onChange={handleMobileDateChange}
                className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !value && "text-muted-foreground"
                )}
            />
        </div>
    )
  }

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);

  return (
    <div>
      <div className="flex items-center rounded-md h-10 w-fit">
         <Input 
            placeholder="DD"
            value={day}
            onChange={handleDayChange}
            className="w-12 border-0 p-0 shadow-none focus-visible:ring-0 text-center bg-transparent"
            maxLength={2}
         />
         <span className="text-muted-foreground">/</span>
        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0 h-auto w-auto min-w-[100px] focus-visible:ring-0 bg-transparent">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">/</span>
         <Select value={year} onValueChange={handleYearChange}>
          <SelectTrigger className="border-0 p-0 shadow-none focus:ring-0 h-auto w-auto min-w-[70px] focus-visible:ring-0 bg-transparent">
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

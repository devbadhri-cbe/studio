
"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { ChevronDown } from "lucide-react"

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
  label?: string;
}

const months = [
    { value: '0', label: 'Jan' },
    { value: '1', label: 'Feb' },
    { value: '2', label: 'Mar' },
    { value: '3', label: 'Apr' },
    { value: '4', label: 'May' },
    { value: '5', label: 'Jun' },
    { value: '6', label: 'Jul' },
    { value: '7', label: 'Aug' },
    { value: '8', label: 'Sep' },
    { value: '9', label: 'Oct' },
    { value: '10', label: 'Nov' },
    { value: '11', label: 'Dec' },
];

const days = Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }));

export function DatePicker({
  value,
  onChange,
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const isMobile = useIsMobile();

  const [day, setDay] = React.useState<string>(() => value ? format(value, 'd') : '');
  const [month, setMonth] = React.useState<string>(() => value ? String(value.getMonth()) : '');
  const [year, setYear] = React.useState<string>(() => value ? format(value, 'yyyy') : '');

  React.useEffect(() => {
    if (value && isValid(value)) {
      setDay(format(value, 'd'));
      setMonth(String(value.getMonth()));
      setYear(format(value, 'yyyy'));
    } else {
        setDay('');
        setMonth('');
        setYear('');
    }
  }, [value]);

  const handleDateChange = (newDay: string, newMonth: string, newYear: string) => {
    if (newDay && newMonth && newYear && newYear.length === 4) {
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
  };

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    handleDateChange(newDay, month, year);
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    handleDateChange(day, newMonth, year);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    handleDateChange(day, month, newYear);
  };

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
            value={value && isValid(value) ? format(value, 'yyyy-MM-dd') : ''}
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
    <div className="flex items-center rounded-md border border-input h-10 w-full px-1.5 space-x-1">
      <div className="w-full">
        <Select value={day} onValueChange={handleDayChange}>
          <SelectTrigger icon={<ChevronDown className="h-4 w-4 opacity-50" />} className="border-0 p-2 shadow-none focus:ring-0 h-auto w-full focus-visible:ring-0 bg-transparent justify-between">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map(d => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="text-muted-foreground">/</span>

      <div className="w-full">
        <Select value={month} onValueChange={handleMonthChange}>
            <SelectTrigger icon={<ChevronDown className="h-4 w-4 opacity-50" />} className="border-0 p-2 shadow-none focus:ring-0 h-auto w-full focus-visible:ring-0 bg-transparent justify-between">
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
       </div>

      <span className="text-muted-foreground">/</span>
      
      <div className="w-full">
        <Select value={year} onValueChange={handleYearChange}>
            <SelectTrigger icon={<ChevronDown className="h-4 w-4 opacity-50" />} className="border-0 p-2 shadow-none focus:ring-0 h-auto w-full focus-visible:ring-0 bg-transparent justify-between">
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

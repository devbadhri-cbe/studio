
"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Calendar } from "./calendar"
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './button';


interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
  label?: string;
}

export function DatePicker({
  value,
  onChange,
  fromYear = new Date().getFullYear() - 100,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const isMobile = useIsMobile();

  const [open, setOpen] = React.useState(false);
  
  if (isMobile) {
    const handleMobileDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (!dateValue) {
            onChange(undefined);
            return;
        }
        const date = parse(dateValue, 'yyyy-MM-dd', new Date());
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
            style={{ colorScheme: 'light' }}
        />
    )
  }


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(day) => {
            onChange(day);
            setOpen(false);
          }}
          fromYear={fromYear}
          toYear={toYear}
          captionLayout="dropdown-buttons"
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}


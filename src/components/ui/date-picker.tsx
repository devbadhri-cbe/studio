
"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { Input } from "./input"

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
  fromYear,
  toYear,
}: DatePickerProps) {
  const isMobile = useIsMobile();
  
  const handleDateSelect = (selectedDate?: Date) => {
    onChange(selectedDate);
  }

  // For mobile devices, render the native date input for better UX.
  if (isMobile) {
    const handleMobileDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // The native input gives a "yyyy-MM-dd" string.
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

  // For desktop, use the popover-based calendar.
  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder || "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  )
}

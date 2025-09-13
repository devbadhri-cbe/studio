
"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { Input } from "./input"

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
  fromYear,
  toYear,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
        // The native input returns date as 'yyyy-MM-dd'
        const date = parse(e.target.value, 'yyyy-MM-dd', new Date());
        onChange(date);
      } else {
        onChange(undefined);
      }
    };
    
    return (
        <Input
          type="date"
          value={value ? format(value, 'yyyy-MM-dd') : ''}
          onChange={handleNativeChange}
          className="w-full justify-start text-left font-normal"
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
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
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

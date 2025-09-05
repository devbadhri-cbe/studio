
"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
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
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    // The native input returns a "yyyy-MM-dd" string.
    const newDate = parse(dateString, 'yyyy-MM-dd', new Date());
    if (isValid(newDate)) {
      onChange(newDate);
    } else {
      onChange(undefined);
    }
  };

  if (isMobile) {
    return (
      <Input
        type="date"
        value={value ? format(value, 'yyyy-MM-dd') : ''}
        onChange={handleNativeDateChange}
        className={cn(
          "w-full justify-start text-left font-normal h-10",
          !value && "text-muted-foreground"
        )}
      />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent
        className="w-auto p-0"
        onInteractOutside={(e) => {
          if (
            e.target instanceof HTMLElement &&
            (e.target.closest('[data-radix-select-content]') ||
             e.target.closest('[data-radix-select-trigger]'))
          ) {
            e.preventDefault();
          }
        }}
        >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  )
}

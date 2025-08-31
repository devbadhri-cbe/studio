
"use client"

import * as React from "react"
import { format } from "date-fns"
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

interface DatePickerProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'onChange' | 'value'> {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ value, onChange, className, placeholder, fromYear, toYear, ...props }, ref) => {
    const isMobile = useIsMobile();
    const nativeInputRef = React.useRef<HTMLInputElement>(null);
  
    // For mobile, render a button that triggers the native date picker
    if (isMobile) {
        const dateString = value ? format(value, 'yyyy-MM-dd') : '';

        const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const dateValue = e.target.value;
            const newDate = dateValue ? new Date(dateValue + 'T00:00:00') : undefined;
            onChange(newDate);
        };
        
        return (
          <div className="relative w-full">
              <Button
                  ref={ref}
                  variant="outline"
                  className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !value && "text-muted-foreground",
                      className
                  )}
                  onClick={() => nativeInputRef.current?.showPicker()}
                  {...props}
              >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(value, "PPP") : <span>{placeholder || 'Pick a date'}</span>}
              </Button>
              <Input
                  ref={nativeInputRef}
                  type="date"
                  value={dateString}
                  onChange={handleNativeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  max={format(new Date(), 'yyyy-MM-dd')}
              />
          </div>
        )
    }
  
    // For desktop, render the custom popover calendar
    const captionLayout = fromYear && toYear ? "dropdown-buttons" : "buttons";
  
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !value && "text-muted-foreground",
              className
            )}
            {...props}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder || 'Pick a date'}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            defaultMonth={value}
            initialFocus
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            captionLayout={captionLayout}
            fromYear={fromYear || new Date().getFullYear() - 100}
            toYear={toYear || new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
    )
  }
)

DatePicker.displayName = 'DatePicker';

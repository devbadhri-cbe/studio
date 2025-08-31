
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
    const [dateString, setDateString] = React.useState<string>(value ? format(value, 'yyyy-MM-dd') : '');

    React.useEffect(() => {
        setDateString(value ? format(value, 'yyyy-MM-dd') : '');
    }, [value]);

    const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        setDateString(dateValue);
        // Date from native picker is yyyy-MM-dd. We need to parse it considering the local timezone.
        const parsedDate = dateValue ? parse(dateValue, 'yyyy-MM-dd', new Date()) : undefined;
        if (isValid(parsedDate) || !dateValue) {
             onChange(parsedDate);
        }
    }
    
    if (isMobile) {
        return (
            <div className={cn("relative flex items-center w-full h-10", className)}>
                <div className="flex items-center absolute inset-0 pointer-events-none px-3">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className={cn("text-sm", !value && "text-muted-foreground")}>
                        {value ? format(value, "PPP") : (placeholder || 'Pick a date')}
                    </span>
                </div>
                <Input
                    type="date"
                    value={dateString}
                    onChange={handleNativeChange}
                    className="w-full h-full opacity-0"
                    max={format(new Date(), 'yyyy-MM-dd')}
                />
            </div>
        )
    }
  
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
            initialFocus
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
            captionLayout={captionLayout}
            fromYear={fromYear}
            toYear={toYear}
          />
        </PopoverContent>
      </Popover>
    )
  }
)

DatePicker.displayName = 'DatePicker';

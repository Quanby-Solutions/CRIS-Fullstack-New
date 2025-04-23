"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { forwardRef, useEffect, useState, useRef } from "react";

interface DatePickerFieldProps {
  field: {
    value: Date | string | null;
    onChange: (date: Date | string | null) => void;
  };
  label: string;
  placeholder?: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const parseJsonDate = (value: any): Date | string | undefined => {
  if (value === null || value === undefined) return undefined;

  // If it's already a Date object, return it
  if (value instanceof Date) {
    return value;
  }

  // If it's a string, try to parse it
  if (typeof value === "string") {
    // Trim the string to remove any leading/trailing whitespace
    const trimmedValue = value.trim();

    // Regex for strict machine date formats
    const strictMachineDateFormats = [
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, // ISO datetime
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    ];

    // Regex for more human-readable or verbose date formats
    const verboseDateFormats = [
      /^[A-Za-z]+ \d{1,2},? \d{4}$/, // "January 24, 2025" or "Jan 24 2025"
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/, // DD-MM-YYYY
    ];

    // Check if the trimmed value matches any strict machine date formats
    const isStrictMachineDate = strictMachineDateFormats.some((format) =>
      format.test(trimmedValue)
    );

    // Check if the trimmed value matches any verbose date formats
    const isVerboseDate = verboseDateFormats.some((format) =>
      format.test(trimmedValue)
    );

    // If it's a strict machine date, try to convert to Date
    if (isStrictMachineDate) {
      try {
        const date = new Date(trimmedValue);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {
        // If parsing fails, continue
      }
    }

    // If it's a verbose date or doesn't look like a machine date, return as string
    if (isVerboseDate || !isStrictMachineDate) {
      return trimmedValue;
    }
  }

  // For other types, try to create a date or convert to string
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {}

  // Fallback to string conversion
  return String(value);
};

const DatePickerString = forwardRef<HTMLButtonElement, DatePickerFieldProps>(
  ({ field, label, placeholder = "Please select a date" }, ref) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [inputMode, setInputMode] = useState<"select" | "date" | "string">(
      "select"
    );
    const [customDateString, setCustomDateString] = useState("");

    // Use a ref to track manual mode changes vs. automatic ones from useEffect
    const isManualModeChange = useRef(false);

    useEffect(() => {
      // Skip re-determining the mode if it was just manually set
      if (isManualModeChange.current) {
        isManualModeChange.current = false;
        return;
      }

      if (field.value) {
        const parsedValue = parseJsonDate(field.value);

        // If parsedValue is a Date object, switch to date mode
        if (parsedValue instanceof Date) {
          setInputMode("date");
          setCurrentDate(parsedValue);
        }
        // If parsedValue is a string, switch to string mode
        else if (typeof parsedValue === "string") {
          setInputMode("string");
          setCustomDateString(parsedValue);
        }
      }
    }, [field.value]);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const years = Array.from(
      { length: new Date().getFullYear() - 1900 + 1 },
      (_, i) => new Date().getFullYear() - i
    );

    const handleMonthChange = (month: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(month);
      setCurrentDate(newDate);
      const selectedDate = new Date(currentYear, month, 1);
      if (selectedDate <= new Date()) {
        field.onChange(selectedDate);
      }
    };

    const handleYearChange = (year: number) => {
      const newDate = new Date(currentDate);
      newDate.setFullYear(year);
      setCurrentDate(newDate);
      const selectedDate = new Date(year, currentMonth, 1);
      if (selectedDate <= new Date()) {
        field.onChange(selectedDate);
      }
    };

    const handleCustomInputChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const value = e.target.value;
      setCustomDateString(value);
      field.onChange(value);
    };

    const handleSwitchToSelect = () => {
      isManualModeChange.current = true;
      setInputMode("select");
      field.onChange(null); // Reset value when switching back
    };

    const handleModeChange = (value: string) => {
      if (value === "date" || value === "string") {
        isManualModeChange.current = true;
        setInputMode(value as "date" | "string");
        if (value === "string") {
          setCustomDateString("");
          field.onChange("");
        } else if (value === "date") {
          field.onChange(null);
        }
      }
    };

    // Display formatted date or placeholder text
    const displayValue = () => {
      if (field.value) {
        if (typeof field.value === "string") {
          if (isNaN(Date.parse(field.value))) {
            // For long text inputs, truncate the display if needed
            const maxDisplayLength = 25;
            if (field.value.length > maxDisplayLength) {
              return `${field.value.substring(0, maxDisplayLength)}...`;
            }
            return field.value; // Display the string as is
          } else {
            return format(new Date(field.value), "MM/dd/yyyy");
          }
        } else if (
          field.value instanceof Date &&
          !isNaN(field.value.getTime())
        ) {
          return format(field.value, "MM/dd/yyyy");
        }
      }
      return placeholder;
    };

    return (
      <FormItem>
        <FormLabel>{label}</FormLabel>

        <div className="relative">
          {inputMode === "select" ? (
            // Type selector
            <Select onValueChange={handleModeChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select input type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Picker</SelectItem>
                <SelectItem value="string">Text Input</SelectItem>
              </SelectContent>
            </Select>
          ) : inputMode === "date" ? (
            // Date Picker with close button
            <div className="flex space-x-2">
              <div className="flex-1">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        ref={ref}
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full h-10 flex items-center justify-between rounded-md border border-muted-foreground/90 bg-background px-3 py-2 text-sm ring-offset-background",
                          "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {displayValue()}
                        <CalendarIcon className="h-4 w-4 opacity-50 shrink-0 ml-auto" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="border-b border-border p-3">
                      <div className="flex items-center justify-between space-x-2">
                        {/* Month Selector */}
                        <Select
                          value={currentMonth.toString()}
                          onValueChange={(value) =>
                            handleMonthChange(parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue>{MONTHS[currentMonth]}</SelectValue>
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {MONTHS.map((month, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Year Selector */}
                        <Select
                          value={currentYear.toString()}
                          onValueChange={(value) =>
                            handleYearChange(parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-[95px] h-8">
                            <SelectValue>{currentYear}</SelectValue>
                          </SelectTrigger>
                          <SelectContent position="popper">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Calendar
                      mode="single"
                      selected={
                        typeof field.value === "string" &&
                        !isNaN(Date.parse(field.value))
                          ? new Date(field.value)
                          : typeof field.value !== "string"
                          ? field.value || undefined
                          : undefined
                      }
                      month={currentDate}
                      onMonthChange={setCurrentDate}
                      onSelect={(date) => {
                        field.onChange(date || null);
                        setCalendarOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="rounded-b-md"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwitchToSelect}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // Custom String Input with close button
            <div className="flex space-x-2">
              <FormControl className="flex-1">
                <Input
                  placeholder="Enter date information (up to 100 characters)"
                  value={customDateString}
                  onChange={handleCustomInputChange}
                  className="h-10"
                  maxLength={100} // Allow up to 100 characters
                  style={{ minHeight: "40px" }} // Ensure input is tall enough
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwitchToSelect}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <FormMessage />
      </FormItem>
    );
  }
);

DatePickerString.displayName = "DatePickerString";
export default DatePickerString;

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
import { forwardRef, useEffect, useState } from "react";

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

const DatePickerString = forwardRef<HTMLButtonElement, DatePickerFieldProps>(
  ({ field, label, placeholder = "Please select a date" }, ref) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [inputMode, setInputMode] = useState<"select" | "date" | "string">(
      "select"
    );
    const [customDateString, setCustomDateString] = useState("");

    useEffect(() => {
      let date: Date;
      if (field.value) {
        if (typeof field.value === "string" && isNaN(Date.parse(field.value))) {
          // If it's a string that can't be parsed as a date
          setInputMode("string");
          setCustomDateString(field.value);
        } else {
          // If it's a Date object or string that can be parsed
          setInputMode("date");
          date =
            typeof field.value === "string"
              ? new Date(field.value)
              : field.value;
          if (!isNaN(date.getTime())) {
            setCurrentDate(date);
          }
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
      setInputMode("select");
      field.onChange(null); // Reset value when switching back
    };

    const handleModeChange = (value: string) => {
      if (value === "date" || value === "string") {
        setInputMode(value as "date" | "string");
        if (value === "string") {
          setCustomDateString("");
        }
      }
    };

    // Display formatted date or placeholder text
    const displayValue = () => {
      if (field.value) {
        if (typeof field.value === "string") {
          if (isNaN(Date.parse(field.value))) {
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
                  placeholder="Enter date (e.g., Birth Year only, Unknown, etc.)"
                  value={customDateString}
                  onChange={handleCustomInputChange}
                  className="h-10"
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

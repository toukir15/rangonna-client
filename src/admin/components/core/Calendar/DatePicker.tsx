// /components/core/Calendar/DatePicker.tsx
"use client"; // If this component is used in a client-side environment for Next.js

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { parse, isValid } from "date-fns"; // Import isValid to check if parsed date is valid
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps extends Omit<any, "onChange" | "selected"> {
  selectedDate: Date | string | null;
  onChange: (date: Date | null) => void;
  label?: string;
  dateFormat?: string; // e.g., "dd-MM-yy", "MM/dd/yyyy"
  isDisabled?: boolean;
  placeholderText?: string;
  wrapperClassName?: string;
  error?: string;
  required?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  selectedDate,
  onChange,
  label,
  dateFormat = "dd-MM-yy",
  isDisabled = false,
  placeholderText = "Select a date",
  wrapperClassName = "",
  error,
  required = false,
  showAllOption = false,
  allOptionLabel = "All",
  ...props
}) => {
  const parseDateString = (
    dateString: string | null,
    format: string
  ): Date | null => {
    if (!dateString) return null;
    try {
      const parsed = parse(dateString, format, new Date());

      return isValid(parsed) ? parsed : null;
    } catch (error) {
      console.warn(
        "CustomDatePicker: Error parsing date string with date-fns:",
        dateString,
        error
      );

      const nativeDate = new Date(dateString);
      return isValid(nativeDate) ? nativeDate : null;
    }
  };

  const [date, setDate] = useState<Date | null>(() => {
    if (selectedDate instanceof Date) {
      return selectedDate;
    } else if (typeof selectedDate === "string") {
      return parseDateString(selectedDate, dateFormat);
    }
    return null;
  });

  useEffect(() => {
    if (selectedDate instanceof Date) {
      setDate(selectedDate);
    } else if (typeof selectedDate === "string") {
      setDate(parseDateString(selectedDate, dateFormat));
    } else {
      setDate(null);
    }
  }, [selectedDate, dateFormat]);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
    onChange(newDate);
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`mb-2 ${wrapperClassName} w-full`}>
      {label && (
        <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
          {label}{" "}
          {required && (
            <span className="text-red-400 font-inter text-[12px] font-semibold">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative w-full">
        <DatePicker
          selected={date}
          onChange={handleDateChange}
          dateFormat={dateFormat}
          disabled={isDisabled}
          placeholderText={placeholderText}
          wrapperClassName={wrapperClassName}
          open={showAllOption ? isOpen : undefined}
          onInputClick={
            showAllOption ? () => setIsOpen(true) : (props as any).onInputClick
          }
          onClickOutside={
            showAllOption
              ? () => setIsOpen(false)
              : (props as any).onClickOutside
          }
          onSelect={showAllOption ? () => setIsOpen(false) : undefined}
          renderCustomHeader={
            showAllOption
              ? () => (
                  <div className="flex justify-start px-2 pt-2 pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleDateChange(null);
                        setIsOpen(false);
                      }}
                      className="px-2 py-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200"
                    >
                      {allOptionLabel}
                    </button>
                  </div>
                )
              : undefined
          }
          className={`
            w-full rounded-md border-gray-300 dark:border-gray-500 dark:text-gray-300 shadow-sm
            focus:border-blue-500 focus:ring-blue-500
            sm:text-sm px-2 py-2 border
            ${
              isDisabled
                ? "bg-gray-100 cursor-not-allowed dark:bg-gray-700"
                : "bg-white dark:bg-gray-700"
            }
            ${error ? "border-red-500" : "border-gray-300"}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CustomDatePicker;

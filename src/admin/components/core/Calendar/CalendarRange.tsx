"use client";
import React, { useState, useEffect, useRef } from "react";
import Icon from "../Icon/Icon";
import Calendar from "./Calendar";
import Button from "../Button/Button";

interface IDateRange {
  startDate: Date;
  endDate: Date;
  label?: string;
}
interface IProps {
  range: IDateRange;
  setRange: (r: IDateRange) => void;
  className?: string;
}

const CalendarRange: React.FC<IProps> = ({ range, setRange, className }) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [tempRange, setTempRange] = useState<IDateRange>(range);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempRange(range);
  }, [range]);

  const handleDateChange = (value: IDateRange) => {
    setTempRange(value);
  };

  const handleApply = () => {
    setRange(tempRange);
    setIsCalendarVisible(false);
  };

  const toggleCalendarVisibility = () => {
    if (!isCalendarVisible) setTempRange(range);
    setIsCalendarVisible(!isCalendarVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={calendarRef}>
      {/* Display box */}
      <div
        className={`border rounded-lg px-3 py-[7px] bg-white dark:bg-gray-800 dark:text-white md:w-80 w-full cursor-pointer ${className} ${range.label ? "border-[#22C55E]" : ""
          }`}
        onClick={toggleCalendarVisibility}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Icon name={"calendar_month"} size={20} variant="outlined" />
            <p>{range.label || "Loading..."}</p>
          </div>
          <Icon
            name={
              isCalendarVisible ? "keyboard_arrow_down" : "keyboard_arrow_up"
            }
            variant="outlined"
            className="border-l border-gray-300 px-1 text-gray-400"
          />
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isCalendarVisible && (
        <div className="absolute z-20 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-500 border shadow-lg rounded-lg mt-1 w-full md:w-auto">
          <Calendar dateRange={tempRange} onChange={handleDateChange} />
          <div className="flex justify-end gap-2 py-3 px-4 border-t dark:border-t-gray-500">
            <Button
              className="bg-gray-400 !py-1.5"
              onClick={() => setIsCalendarVisible(false)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-500 !py-1.5" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarRange;

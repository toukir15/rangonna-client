"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "../Icon/Icon";
import Calendar from "./Calendar";

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

const formatRangeDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatRangeSummary = (range: IDateRange) => {
  const start = formatRangeDate(range.startDate);
  const end = formatRangeDate(range.endDate);
  return start === end ? start : `${start} – ${end}`;
};

const CalendarRange: React.FC<IProps> = ({ range, setRange, className }) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [tempRange, setTempRange] = useState<IDateRange>(range);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const calendarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
      const target = event.target as Node;
      if (
        calendarRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setIsCalendarVisible(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isCalendarVisible) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPanelStyle({
        top: rect.bottom + 8,
        left: rect.left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isCalendarVisible]);

  useEffect(() => {
    if (!isCalendarVisible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCalendarVisible(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCalendarVisible]);

  return (
    <div className={`date-filter ${className ?? ""}`} ref={calendarRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`date-filter-trigger ${isCalendarVisible ? "is-open" : ""}`}
        onClick={toggleCalendarVisibility}
        aria-expanded={isCalendarVisible}
        aria-haspopup="dialog"
      >
        <span className="date-filter-trigger-icon">
          <Icon name="calendar_month" size={16} />
        </span>
        <span className="date-filter-trigger-copy">
          <span className="date-filter-trigger-kicker">Date range</span>
          <span className="date-filter-trigger-label">
            {range.label || "Select range"}
          </span>
        </span>
        <Icon
          name="expand_more"
          size={18}
          className="date-filter-chevron"
        />
      </button>

      {isCalendarVisible &&
        createPortal(
          <div
            ref={panelRef}
            className="date-filter-panel"
            style={panelStyle}
            role="dialog"
            aria-label="Date range"
          >
            <div className="date-filter-panel-head">
              <p className="date-filter-panel-title">
                {tempRange.label || "Custom range"}
              </p>
              <p className="date-filter-panel-meta">
                {formatRangeSummary(tempRange)}
              </p>
            </div>
            <Calendar dateRange={tempRange} onChange={handleDateChange} />
            <div className="date-filter-footer">
              <button
                type="button"
                className="date-filter-cancel"
                onClick={() => setIsCalendarVisible(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="date-filter-apply"
                onClick={handleApply}
              >
                Apply
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CalendarRange;

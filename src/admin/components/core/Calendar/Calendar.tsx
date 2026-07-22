// "use client";
// import { useGlobalContext } from "@admin/context/GlobalContext";
// import React, { FC, useState, useEffect, useMemo } from "react";
// import { DateRange, RangeKeyDict } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";

// interface CalendarProps {
//   dateRange?: { startDate: Date; endDate: Date; label?: string };
//   onChange: (value: { startDate: Date; endDate: Date; label?: string }) => void;
// }

// const startOfDay = (d: Date) => {
//   const x = new Date(d);
//   x.setHours(0, 0, 0, 0);
//   return x;
// };
// const endOfDay = (d: Date) => {
//   const x = new Date(d);
//   x.setHours(23, 59, 59, 999);
//   return x;
// };

// // ✅ Predefined Ranges (সব dynamic)
// const todayRange = () => {
//   const t = new Date();
//   return { label: "Today", startDate: startOfDay(t), endDate: endOfDay(t) };
// };
// const yesterdayRange = () => {
//   const y = new Date();
//   y.setDate(y.getDate() - 1);
//   return { label: "Yesterday", startDate: startOfDay(y), endDate: endOfDay(y) };
// };
// const last24HoursRange = () => ({
//   label: "Last 24 Hours",
//   startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
//   endDate: new Date(),
// });
// const last7DaysRange = () => {
//   const end = new Date();
//   const start = new Date();
//   start.setDate(end.getDate() - 6);
//   return {
//     label: "Last 7 Days",
//     startDate: startOfDay(start),
//     endDate: endOfDay(end),
//   };
// };
// const last30DaysRange = () => {
//   const end = new Date();
//   const start = new Date();
//   start.setDate(end.getDate() - 29);
//   return {
//     label: "Last 30 Days",
//     startDate: startOfDay(start),
//     endDate: endOfDay(end),
//   };
// };
// const last90DaysRange = () => {
//   const end = new Date();
//   const start = new Date();
//   start.setDate(end.getDate() - 89);

//   return {
//     label: "Last 90 Days",
//     startDate: startOfDay(start),
//     endDate: endOfDay(end),
//   };
// };
// const thisMonthRange = () => {
//   const t = new Date();
//   return {
//     label: "This Month",
//     startDate: startOfDay(new Date(t.getFullYear(), t.getMonth(), 1)),
//     endDate: endOfDay(t),
//   };
// };
// const lastMonthRange = () => {
//   const t = new Date();
//   const s = new Date(t.getFullYear(), t.getMonth() - 1, 1);
//   const e = new Date(t.getFullYear(), t.getMonth(), 0);
//   return {
//     label: "Last Month",
//     startDate: startOfDay(s),
//     endDate: endOfDay(e),
//   };
// };
// const maxRange = () => {
//   const today = new Date();
//   const t = new Date(today);
//   const s = new Date(2020, 0, 1);
//   return { label: "Max", startDate: startOfDay(s), endDate: endOfDay(t) };
// };

// const Calendar: FC<CalendarProps> = ({
//   dateRange = last30DaysRange(),
//   onChange,
// }) => {
//   const { permissionList } = useGlobalContext();
//   const getInitialRange = () => {
//     switch (dateRange.label) {
//       case "Today":
//         return todayRange();
//       case "Yesterday":
//         return yesterdayRange();
//       case "Last 24 Hours":
//         return last24HoursRange();
//       case "Last 7 Days":
//         return last7DaysRange();
//       case "Last 30 Days":
//         return last30DaysRange();
//       case "Last 90 Days":
//         return last90DaysRange();
//       case "This Month":
//         return thisMonthRange();
//       case "Last Month":
//         return lastMonthRange();
//       case "Max":
//         return maxRange();
//       default:
//         return {
//           label: "Custom Range",
//           startDate: dateRange.startDate,
//           endDate: dateRange.endDate,
//         };
//     }
//   };

//   const initial = getInitialRange();
//   const [range, setRange] = useState({
//     startDate: initial.startDate,
//     endDate: initial.endDate,
//     key: "selection" as const,
//   });
//   const [selectedLabel, setSelectedLabel] = useState(initial.label);

//   useEffect(() => {
//     const updated = getInitialRange();
//     setRange({
//       startDate: updated.startDate,
//       endDate: updated.endDate,
//       key: "selection",
//     });
//     setSelectedLabel(updated.label);
//   }, [dateRange.startDate, dateRange.endDate, dateRange.label]);

//   // ✅ সবসময় fresh date নিতে useMemo তে Date.now() dependency
//   // const customRanges = useMemo(
//   //   () => [
//   //     todayRange(),
//   //     last24HoursRange(),
//   //     yesterdayRange(),
//   //     last7DaysRange(),
//   //     last30DaysRange(),
//   //     last90DaysRange(),
//   //     thisMonthRange(),
//   //     lastMonthRange(),
//   //     maxRange(),
//   //     {
//   //       label: "Custom Range",
//   //       startDate: dateRange.startDate,
//   //       endDate: dateRange.endDate,
//   //     },
//   //   ],
//   //   [dateRange.startDate, dateRange.endDate, Date.now()]
//   // );

//   const customRanges = useMemo(() => {
//     const ranges = [];

//     if (permissionList.includes("date_filter_today")) {
//       ranges.push(todayRange());
//     }

//     if (permissionList.includes("date_filter_yesterday")) {
//       ranges.push(yesterdayRange());
//     }

//     if (permissionList.includes("date_filter_this_week")) {
//       ranges.push(last7DaysRange());
//     }

//     if (permissionList.includes("date_filter_last_quarter")) {
//       ranges.push(last30DaysRange());
//     }

//     if (permissionList.includes("date_filter_this_month")) {
//       ranges.push(thisMonthRange());
//     }

//     if (permissionList.includes("date_filter_last_month")) {
//       ranges.push(lastMonthRange());
//     }
//     if (permissionList.includes("date_filter_last_quarter")) {
//       ranges.push(last90DaysRange());
//     }

//     if (permissionList.includes("date_filter_max")) {
//       ranges.push(maxRange());
//     }

//     if (permissionList.includes("date_filter_custom_range")) {
//       ranges.push({
//         label: "Custom Range",
//         startDate: dateRange.startDate,
//         endDate: dateRange.endDate,
//       });
//     }

//     return ranges;
//   }, [dateRange.startDate, dateRange.endDate, permissionList]);

//   const applyRange = (startDate: Date, endDate: Date, label?: string) => {
//     const s = startOfDay(startDate);
//     const e = endOfDay(endDate);
//     setRange({ startDate: s, endDate: e, key: "selection" });
//     setSelectedLabel(label || "Custom Range");
//     onChange({ startDate: s, endDate: e, label: label || "Custom Range" });
//   };

//   const handleRangeChange = (ranges: RangeKeyDict) => {
//     if (ranges.selection?.startDate && ranges.selection?.endDate) {
//       let { startDate, endDate } = ranges.selection;
//       if (startDate > endDate) [startDate, endDate] = [endDate, startDate];
//       applyRange(startDate, endDate, "Custom Range");
//     }
//   };

//   const currentYear = new Date().getFullYear();

//   return (
//     <div className="calendar-container md:flex gap-1">
//       {/* Sidebar Labels */}
//       <div className="lg:border-r dark:border-r-gray-500 px-4 w-full">
//         {customRanges.map((opt) => {
//           const isSelected = selectedLabel === opt.label;
//           return (
//             <div
//               key={opt.label}
//               onClick={() => applyRange(opt.startDate, opt.endDate, opt.label)}
//               className={`w-full mb-1 rounded cursor-pointer transition-colors ${isSelected
//                 ? "bg-blue-500 text-white "
//                 : "hover:bg-gray-100 text-gray-700 dark:text-gray-300"
//                 }`}
//             >
//               <p className="text-xs px-3 py-1 text-nowrap md:mt-3 mt-1">
//                 {opt.label}
//               </p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Calendar */}
//       <div className="md:block hidden">
//         <DateRange
//           ranges={[range]}
//           onChange={handleRangeChange}
//           months={2}
//           direction="horizontal"
//           preventSnapRefocus
//           initialFocusedRange={[0, 0]}
//           minDate={new Date("2020-01-01")}
//           // maxDate={new Date("2026-12-31")}
//           maxDate={new Date(`${currentYear}-12-31`)}
//           className="w-[500px] dark:text-white dark:bg-slate-800"
//         />
//       </div>
//     </div>
//   );
// };

// export default Calendar;


"use client";
import { useGlobalContext } from "@admin/context/GlobalContext";
import React, { FC, useState, useEffect, useMemo } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface CalendarProps {
  dateRange?: { startDate: Date; endDate: Date; label?: string };
  onChange: (value: { startDate: Date; endDate: Date; label?: string }) => void;
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const todayRange = () => {
  const t = new Date();
  return { label: "Today", startDate: startOfDay(t), endDate: endOfDay(t) };
};

const yesterdayRange = () => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return { label: "Yesterday", startDate: startOfDay(y), endDate: endOfDay(y) };
};

const last24HoursRange = () => ({
  label: "Last 24 Hours",
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: new Date(),
});

const last7DaysRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    label: "Last 7 Days",
    startDate: startOfDay(start),
    endDate: endOfDay(end),
  };
};

const last30DaysRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    label: "Last 30 Days",
    startDate: startOfDay(start),
    endDate: endOfDay(end),
  };
};

const last90DaysRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 89);

  return {
    label: "Last 90 Days",
    startDate: startOfDay(start),
    endDate: endOfDay(end),
  };
};

const thisMonthRange = () => {
  const t = new Date();
  return {
    label: "This Month",
    startDate: startOfDay(new Date(t.getFullYear(), t.getMonth(), 1)),
    endDate: endOfDay(t),
  };
};

const lastMonthRange = () => {
  const t = new Date();
  const s = new Date(t.getFullYear(), t.getMonth() - 1, 1);
  const e = new Date(t.getFullYear(), t.getMonth(), 0);
  return {
    label: "Last Month",
    startDate: startOfDay(s),
    endDate: endOfDay(e),
  };
};

const maxRange = () => {
  const today = new Date();
  const t = new Date(today);
  const s = new Date(2020, 0, 1);
  return { label: "Max", startDate: startOfDay(s), endDate: endOfDay(t) };
};

const Calendar: FC<CalendarProps> = ({
  dateRange = last30DaysRange(),
  onChange,
}) => {
  const { permissionList } = useGlobalContext();

  const getInitialRange = () => {
    switch (dateRange.label) {
      case "Today":
        return todayRange();
      case "Yesterday":
        return yesterdayRange();
      case "Last 24 Hours":
        return last24HoursRange();
      case "Last 7 Days":
        return last7DaysRange();
      case "Last 30 Days":
        return last30DaysRange();
      case "Last 90 Days":
        return last90DaysRange();
      case "This Month":
        return thisMonthRange();
      case "Last Month":
        return lastMonthRange();
      case "Max":
        return maxRange();
      default:
        return {
          label: "Custom Range",
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        };
    }
  };

  const initial = getInitialRange();

  const [range, setRange] = useState({
    startDate: initial.startDate,
    endDate: initial.endDate,
    key: "selection" as const,
  });

  const [selectedLabel, setSelectedLabel] = useState(initial.label);

  useEffect(() => {
    const updated = getInitialRange();
    setRange({
      startDate: updated.startDate,
      endDate: updated.endDate,
      key: "selection",
    });
    setSelectedLabel(updated.label);
  }, [dateRange.startDate, dateRange.endDate, dateRange.label]);

  const customRanges = useMemo(() => {
    const ranges = [];

    if (permissionList.includes("date_filter_today")) {
      ranges.push(todayRange());
    }

    if (permissionList.includes("date_filter_yesterday")) {
      ranges.push(yesterdayRange());
    }

    if (permissionList.includes("date_filter_this_week")) {
      ranges.push(last7DaysRange());
    }

    if (permissionList.includes("date_filter_last_quarter")) {
      ranges.push(last30DaysRange());
    }

    if (permissionList.includes("date_filter_this_month")) {
      ranges.push(thisMonthRange());
    }

    if (permissionList.includes("date_filter_last_month")) {
      ranges.push(lastMonthRange());
    }

    if (permissionList.includes("date_filter_last_quarter")) {
      ranges.push(last90DaysRange());
    }

    if (permissionList.includes("date_filter_max")) {
      ranges.push(maxRange());
    }

    if (permissionList.includes("date_filter_custom_range")) {
      ranges.push({
        label: "Custom Range",
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }

    return ranges;
  }, [dateRange.startDate, dateRange.endDate, permissionList]);

  const applyRange = (startDate: Date, endDate: Date, label?: string) => {
    const s = startOfDay(startDate);
    const e = endOfDay(endDate);

    setRange({ startDate: s, endDate: e, key: "selection" });
    setSelectedLabel(label || "Custom Range");
    onChange({ startDate: s, endDate: e, label: label || "Custom Range" });
  };

  const isCustomRangeEnabled = permissionList.includes("date_filter_custom_range");
  const isCalendarEnabled = isCustomRangeEnabled && selectedLabel === "Custom Range";

  const handleRangeChange = (ranges: RangeKeyDict) => {
    if (!isCalendarEnabled) return;

    if (ranges.selection?.startDate && ranges.selection?.endDate) {
      let { startDate, endDate } = ranges.selection;

      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      applyRange(startDate, endDate, "Custom Range");
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="calendar-container md:flex gap-1">
      <div className="lg:border-r dark:border-r-gray-500 px-4 w-full">
        {customRanges.map((opt) => {
          const isSelected = selectedLabel === opt.label;

          return (
            <div
              key={opt.label}
              onClick={() => applyRange(opt.startDate, opt.endDate, opt.label)}
              className={`w-full mb-1 rounded cursor-pointer transition-colors ${isSelected
                ? "bg-blue-500 text-white "
                : "hover:bg-gray-100 text-gray-700 dark:text-gray-300"
                }`}
            >
              <p className="text-xs px-3 py-1 text-nowrap md:mt-3 mt-1">
                {opt.label}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className={`relative hidden md:block ${!isCalendarEnabled ? "!hidden" : ""
          }`}
      >
        <DateRange
          ranges={[range]}
          onChange={handleRangeChange}
          months={2}
          direction="horizontal"
          preventSnapRefocus
          initialFocusedRange={[0, 0]}
          minDate={new Date("2020-01-01")}
          maxDate={new Date(`${currentYear}-12-31`)}
          className="w-[500px] dark:text-white dark:bg-slate-800"
        />

        {!isCalendarEnabled && (
          <div className="absolute inset-0 z-10 cursor-not-allowed" />
        )}
      </div>
    </div>
  );
};

export default Calendar;
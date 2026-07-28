"use client";

import { useEffect, useState } from "react";

const formatTime = (ms: number) => {
  if (!ms || ms <= 0) return { hours: "00", minutes: "00", seconds: "00" };
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0",
  );
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return { hours, minutes, seconds };
};

const getNextBoundaryMs = (now: Date) => {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const noonToday = new Date(y, m, d, 12, 0, 0, 0).getTime();
  const midnightNext = new Date(y, m, d + 1, 0, 0, 0, 0).getTime();

  return now.getTime() < noonToday ? noonToday : midnightNext;
};

const DayDealCount = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [endsTonight, setEndsTonight] = useState(true);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const next = getNextBoundaryMs(now);
      setTimeLeft(Math.max(next - now.getTime(), 0));
      const midnightNext = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0,
      ).getTime();
      setEndsTonight(next === midnightNext);
    };

    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, []);

  const { hours, minutes, seconds } = formatTime(timeLeft);

  const units = [
    { value: hours, label: "Hours" },
    { value: minutes, label: "Mins" },
    { value: seconds, label: "Secs" },
  ];

  return (
    <div className="rongonaa-flash-timer" aria-live="polite">
      <p className="rongonaa-flash-timer__label">
        <span className="rongonaa-flash-timer__dot" aria-hidden />
        {endsTonight ? "Ends Tonight" : "Ends At Noon"}
      </p>
      <div className="rongonaa-flash-timer__units">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-stretch">
            {i > 0 && (
              <div className="rongonaa-flash-timer__sep" aria-hidden />
            )}
            <div className="rongonaa-flash-timer__unit">
              <span className="rongonaa-flash-timer__value">{unit.value}</span>
              <span className="rongonaa-flash-timer__unit-label">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayDealCount;

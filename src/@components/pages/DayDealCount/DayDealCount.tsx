"use client";
import Icon from "@/@components/core/Icon/Icon";
import { useEffect, useState } from "react";

const formatTime = (ms: number) => {
  if (!ms || ms <= 0) return { hours: "00", minutes: "00", seconds: "00" };
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
    2,
    "0"
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
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const next = getNextBoundaryMs(now);
      setTimeLeft(Math.max(next - now.getTime(), 0));
    };

    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      const now = new Date();
      const next = getNextBoundaryMs(now);
      setTimeLeft(Math.max(next - now.getTime(), 0));
    }
  }, [timeLeft]);

  const { hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="flex items-center justify-between rounded-md px-1 pb-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <p className="text-base ms-3 text-primary font-bold md:block hidden">
            Ending Offer
          </p>
          <Icon name="alarm" className="text-primary" size={22} />
        </div>
        <div className="flex gap-1 items-center">
          <h3 className="text-base font-bold premium-badge rounded-md text-center px-1.5">
            {hours}
          </h3>
          <span className="text-gold text-base font-bold">:</span>
          <h3 className="text-base font-bold premium-badge rounded-md text-center px-1.5">
            {minutes}
          </h3>
          <span className="text-gold text-base font-bold">:</span>
          <h3 className="text-base font-bold premium-badge rounded-md text-center px-1.5">
            {seconds}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default DayDealCount;

import Icon from "@/@components/core/Icon/Icon";
import { useState, useEffect } from "react";

interface ProductFlashDealProps {
  product: any;
}
export interface FlashDealTime {
  hours: string;
  minutes: string;
  seconds: string;
}

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

const ProductFlashDeal = ({ product }: ProductFlashDealProps) => {
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
    <div className="mb-3 flex flex-col items-center justify-center gap-2 rounded-md premium-gradient px-4 py-2 md:flex-row md:items-center md:justify-between md:gap-0">
      <div className="flex items-center justify-center gap-1">
        <Icon name={"bolt"} className="text-white" />
        <h3 className="text-sm font-bold uppercase text-white sm:text-base md:text-xl">
          অফার শেষ হতে বাকি
        </h3>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div>
          <Icon name={"alarm"} className="mt-1 text-white" />
        </div>

        <div className="flex items-center gap-2">
          <h3 className="rounded-md bg-[#0000004A] px-2 py-1 text-center text-lg font-bold text-white md:text-xl">
            {hours}
          </h3>
          <span className="text-xl font-bold text-white md:text-2xl">:</span>
          <h3 className="rounded-md bg-[#0000004A] px-2 py-1 text-center text-lg font-bold text-white md:text-xl">
            {minutes}
          </h3>
          <span className="text-xl font-bold text-white md:text-2xl">:</span>
          <h3 className="rounded-md bg-[#0000004A] px-2 py-1 text-center text-lg font-bold text-white md:text-xl">
            {seconds}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default ProductFlashDeal;

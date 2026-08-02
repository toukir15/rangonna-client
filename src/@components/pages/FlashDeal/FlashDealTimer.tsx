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
    <div className="rongonaa-pdp__deal" role="timer" aria-live="polite">
      <div className="rongonaa-pdp__deal-copy">
        <span className="rongonaa-pdp__deal-eyebrow">Limited offer</span>
        <p className="rongonaa-pdp__deal-title">অফার শেষ হতে বাকি</p>
      </div>
      <div className="rongonaa-pdp__deal-clock">
        <div className="rongonaa-pdp__deal-unit">
          <span>{hours}</span>
          <small>Hrs</small>
        </div>
        <span className="rongonaa-pdp__deal-sep" aria-hidden>
          :
        </span>
        <div className="rongonaa-pdp__deal-unit">
          <span>{minutes}</span>
          <small>Min</small>
        </div>
        <span className="rongonaa-pdp__deal-sep" aria-hidden>
          :
        </span>
        <div className="rongonaa-pdp__deal-unit">
          <span>{seconds}</span>
          <small>Sec</small>
        </div>
      </div>
    </div>
  );
};

export default ProductFlashDeal;

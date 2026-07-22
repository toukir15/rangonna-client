"use client";
import Icon from "@/@components/core/Icon/Icon";
import { Review, ReviewCarouselProps } from "@/@interfaces/common.interface";
import { trimString } from "@/utils";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const OrderCarousal: React.FC<ReviewCarouselProps> = ({
  reviews = [],
  intervalMs = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const [cardW, setCardW] = useState(0);
  const [paused, setPaused] = useState(false); // <-- NEW

  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);

  // autoplay (stops when paused = true)
  useEffect(() => {
    if (!reviews?.length || paused) return;
    const t = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % reviews.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [reviews?.length ?? 0, intervalMs, paused]);

  // optional: pause when tab is hidden, resume when visible
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => {
      if (containerRef.current) setContainerW(containerRef.current.clientWidth);
      if (firstCardRef.current) setCardW(firstCardRef.current.clientWidth);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    if (firstCardRef.current) ro.observe(firstCardRef.current);
    if (containerRef.current) setContainerW(containerRef.current.clientWidth);
    if (firstCardRef.current) setCardW(firstCardRef.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  const translateX = useMemo(() => {
    if (!reviews?.length || !cardW || !containerW) return 0;
    const trackW = reviews.length * cardW;
    const ideal = currentIndex * cardW - (containerW - cardW) / 2;
    const min = 0;
    const max = Math.max(trackW - containerW, 0);
    return Math.min(Math.max(ideal, min), max);
  }, [currentIndex, cardW, containerW, reviews?.length ?? 0]);

  const goToNext = () => setCurrentIndex((i) => (i + 1) % reviews.length);
  const goToPrevious = () =>
    setCurrentIndex((i) => (i - 1 + reviews.length) % reviews.length);
  const goToIndex = (idx: number) => setCurrentIndex(idx);

  // Handlers to pause/resume on hover (desktop) and hold (mobile)
  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);
  const handleTouchStart = () => setPaused(true);
  const handleTouchEnd = () => setPaused(false);
  const handleTouchCancel = () => setPaused(false);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[350px] mx-auto overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      // You can also add pointer events if you want one API for both:
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translate3d(-${translateX}px, 0, 0)`,
          width: reviews.length ? reviews.length * cardW || "auto" : "auto",
        }}
      >
        {reviews.map((review: Review, idx) => (
          <div
            key={review.id ?? idx}
            ref={idx === 0 ? firstCardRef : undefined}
            className="w-[340px] flex-shrink-0 pt-2 px-2"
          >
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 h-80">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex">
                  <Icon name="star" className="text-yellow-500" size={20} />
                  <Icon name="star" className="text-yellow-500" size={20} />
                  <Icon name="star" className="text-yellow-500" size={20} />
                  <Icon name="star" className="text-yellow-500" size={20} />
                  <Icon name="star" className="text-yellow-500" size={20} />
                </div>
                <p className="font-normal text-gray-500 text-sm">
                  {review.date}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <div className="border border-gray-300 shadow-md font-bold rounded-full h-12 w-12 flex items-center justify-center bg-primary text-white mt-2.5">
                  <p>{review.name?.[0]?.toUpperCase() || "A"}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-start">
                    {review.name}
                  </h3>
                  <div className="text-xs bg-green-600 text-white font-bold rounded-lg px-2 py-0.5 flex items-center gap-1">
                    <Icon name="check" size={18} className="font-bold" />
                    Verified Buyer
                  </div>
                </div>
              </div>

              <p className="text-gray-600 italic mt-4">
                {trimString(review.comment, 280)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        className="absolute cursor-pointer text-center top-1/2 w-10 left-0 -translate-y-1/2 bg-white border border-gray-300 text-gray-500/80 p-2 rounded-full hover:bg-gray-50"
        onClick={goToPrevious}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        &#10094;
      </button>

      <button
        type="button"
        aria-label="Next"
        className="absolute cursor-pointer text-center top-1/2 w-10 right-2 -translate-y-1/2 bg-white border border-gray-300 text-gray-500/80 p-2 rounded-full hover:bg-gray-50"
        onClick={goToNext}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        &#10095;
      </button>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-2">
        {reviews.map((_, index) => (
          <div
            key={index}
            aria-label={`Go to ${index + 1}`}
            className={`w-3 h-1.5 rounded-full cursor-pointer ${
              index === currentIndex ? "bg-primary" : "bg-primary-lighter"
            }`}
            onClick={() => goToIndex(index)}
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        ))}
      </div>

      {/* Optional tiny indicator for debugging */}
      {/* <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-black/60 text-white">
        {paused ? "Paused" : "Playing"}
      </div> */}
    </div>
  );
};

export default OrderCarousal;

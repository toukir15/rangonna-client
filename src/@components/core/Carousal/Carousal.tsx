"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Icon from "../Icon/Icon";
interface Review {
  id: number;
  name: string;
  comment?: string;
  img: any;
}
interface OverflowProps {
  reviews: Review[];
  autoplayMs?: number;
  depth?: number;
  sideRotation?: number;
  sideOffset?: number;
  visibleRange?: number;
}

const clampIndex = (i: number, len: number) => (i + len) % len;

export const CoverCarousel: React.FC<OverflowProps> = ({
  reviews,
  autoplayMs = 3000,
  depth = 120,
  sideRotation = 40,
  sideOffset = 120,
  visibleRange = 2,
}) => {
  const len = reviews.length;
  const [index, setIndex] = useState(0);

  const [dynamicOffset, setDynamicOffset] = useState(sideOffset);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 414) {
        // xs–sm
        setDynamicOffset(90);
      } else if (w < 668) {
        // md
        setDynamicOffset(110);
      } else if (w < 886) {
        // lg
        setDynamicOffset(200);
      } else if (w < 1080) {
        // xl
        setDynamicOffset(260);
      } else if (w < 1440) {
        // 2xl / layout max
        setDynamicOffset(320);
      } else if (w < 1536) {
        setDynamicOffset(370);
      } else {
        // bigger than 1280
        setDynamicOffset(385);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const go = (i: number) => setIndex((prev) => clampIndex(i, len));
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  useEffect(() => {
    if (autoplayMs <= 0 || len <= 1) return;
    const t = setInterval(() => {
      if (!hoverRef.current && !isDragging.current) next();
    }, autoplayMs);
    return () => clearInterval(t);
  }, [autoplayMs, len, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    touchStartX.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    touchDeltaX.current += dx;
  };

  const endDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dragged = -touchDeltaX.current;
    const threshold = 40;
    if (dragged > threshold) next();
    else if (dragged < -threshold) prev();
    touchDeltaX.current = 0;
  };

  const signedOffset = (i: number) => {
    let o = i - index;
    if (o > len / 2) o -= len;
    if (o < -len / 2) o += len;
    return o;
  };

  const slideStyle = (i: number): React.CSSProperties => {
    const offset = signedOffset(i);

    if (Math.abs(offset) > visibleRange) {
      return {
        transform: "translateZ(-9999px)",
        opacity: 0,
        pointerEvents: "none",
      };
    }

    const abs = Math.abs(offset);
    const rotateY = sideRotation * Math.sign(offset);
    const translateX = dynamicOffset * offset;
    const z = abs === 0 ? depth : depth - abs * (depth * 0.6);
    const scale = abs === 0 ? 1 : 1 - abs * 0.08;
    const opacity = abs === 0 ? 1 : 1 - abs * 0.5;

    return {
      transform: `
        translateX(${translateX}px)
        translateZ(${z}px)
        rotateY(${abs === 0 ? 0 : rotateY}deg)
        scale(${scale})
      `,
      opacity,
      zIndex: 100 - abs,
      transition: "transform 450ms ease, opacity 450ms ease",
      cursor: abs === 0 ? "default" : "pointer",
      filter: abs === 0 ? "none" : "brightness(0.95)",
    };
  };

  const halfMaskStyle = (i: number): React.CSSProperties | undefined => {
    const o = signedOffset(i);
    if (o === -1) return { clipPath: "inset(0 10% 0 0)" };
    if (o === 1) return { clipPath: "inset(0 0 0 10%)" };
    return undefined;
  };

  if (len === 0) return null;

  return (
    <div
      className="relative w-full py-4 select-none"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      <div
        ref={trackRef}
        className="relative mx-auto mt-8"
        style={{
          perspective: 1000,
          height: "420px",
          maxWidth: "2000px",
          overflow: "visible",
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {reviews.map((r, i) => (
            <div
              key={r.id}
              role="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => i !== index && go(i)}
              className="
                absolute md:top-2/3 sm:top-2/5 top-2/5 -translate-y-1/2
                w-[72%] sm:w-[65%] md:w-[46%] lg:w-[50%]
                will-change-transform drop-shadow-md
              "
              style={{ ...slideStyle(i), ...halfMaskStyle(i) }}
            >
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="relative w-auto lg:h-[600px] md:h-[500px]  h-[400px]">
                  <Image
                    src={r.img}
                    alt={r.name || "slide"}
                    fill
                    className="object-cover"
                    priority={i < 3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          className="absolute cursor-pointer left-3 md:top-2/3 sm:top-2/5 top-2/4 -translate-y-1/2 z-20 bg-black/65 text-white w-10 h-10 rounded-full grid place-items-center hover:bg-black/70"
          aria-label="Previous"
        >
          <Icon name={"chevron_left"} className="text-white" />
        </button>
        <button
          onClick={next}
          className="absolute cursor-pointer right-3 md:top-2/3 sm:top-2/5 top-2/4 -translate-y-1/2 z-20 bg-black/90 text-white w-10 h-10 rounded-full grid place-items-center hover:bg-black/70"
          aria-label="Next"
        >
          <Icon name={"chevron_right"} />
        </button>

        <div className="absolute md:bottom-2 bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "bg-primary w-6" : "bg-primary-lighter w-3"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

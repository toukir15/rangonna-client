"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { TCustomerLoveItem } from "./getCustomerLoveData";

function ReviewCard({ r }: { r: TCustomerLoveItem }) {
  return (
    <article className="rongonaa-review-card">
      {r.image ? (
        <div className="rongonaa-review-card__media">
          <Image
            src={r.image}
            alt={r.product || r.name}
            fill
            className="object-cover"
            sizes="(max-width: 767px) 82vw, (max-width: 1024px) 50vw, 20vw"
            unoptimized
          />
        </div>
      ) : null}

      <div className="rongonaa-review-card__stars" aria-label={`${r.rating} of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`rongonaa-review-card__star${i < r.rating ? " is-filled" : ""}`}
          >
            ★
          </span>
        ))}
      </div>

      <p className="rongonaa-review-card__text">“{r.text}”</p>

      <div className="rongonaa-review-card__meta">
        <p className="rongonaa-review-card__name">{r.name}</p>
        <p className="rongonaa-review-card__sub">
          {r.city}
          {r.product ? ` · ${r.product}` : ""}
        </p>
      </div>
    </article>
  );
}

export default function CustomerLoveGrid({
  mobile,
  desktop,
}: {
  mobile: TCustomerLoveItem[];
  desktop: TCustomerLoveItem[];
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const items = useMemo(() => {
    if (isMobile && mobile.length) return mobile;
    if (desktop.length) return desktop;
    return mobile;
  }, [isMobile, mobile, desktop]);

  useEffect(() => {
    setActive(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [isMobile, items.length]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    const left =
      card.getBoundingClientRect().left -
      track.getBoundingClientRect().left +
      track.scrollLeft;
    track.scrollTo({ left, behavior: "smooth" });
    setActive(index);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    if (!cards.length) return;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const cardMid = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardMid - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  };

  useEffect(() => {
    if (!isMobile || items.length < 2) return;

    const id = window.setInterval(() => {
      if (pauseRef.current) return;
      const next = (active + 1) % items.length;
      scrollToIndex(next);
    }, 4500);

    return () => window.clearInterval(id);
  }, [isMobile, items.length, active]);

  if (!items.length) return null;

  return (
    <div className="rongonaa-reviews">
      <div
        ref={trackRef}
        className="rongonaa-reviews-grid"
        onScroll={onScroll}
        onPointerDown={() => {
          pauseRef.current = true;
        }}
        onPointerUp={() => {
          pauseRef.current = false;
        }}
        onTouchStart={() => {
          pauseRef.current = true;
        }}
        onTouchEnd={() => {
          pauseRef.current = false;
        }}
      >
        {items.map((r) => (
          <ReviewCard key={`${r.name}-${r.product}`} r={r} />
        ))}
      </div>

      {items.length > 1 ? (
        <div className="rongonaa-reviews-pager" role="tablist" aria-label="Reviews">
          {items.map((r, i) => (
            <button
              key={`${r.name}-dot-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Review ${i + 1}`}
              className={`rongonaa-reviews-dot${i === active ? " is-active" : ""}`}
              onClick={() => {
                pauseRef.current = true;
                scrollToIndex(i);
                window.setTimeout(() => {
                  pauseRef.current = false;
                }, 4000);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TShopOccasionItem } from "./getShopOccasionData";

export default function ShopOccasionGrid({
  mobile,
  desktop,
}: {
  mobile: TShopOccasionItem[];
  desktop: TShopOccasionItem[];
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
      scrollToIndex((active + 1) % items.length);
    }, 4500);

    return () => window.clearInterval(id);
  }, [isMobile, items.length, active]);

  if (!items.length) return null;

  return (
    <div className="rongonaa-occasion">
      <div
        ref={trackRef}
        className="rongonaa-occasion-grid"
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
        {items.map((o) => (
          <Link key={`${o.title}-${o.link}`} href={o.link} className="rongonaa-occasion-card">
            <Image
              src={o.image}
              alt={o.title}
              fill
              className="rongonaa-occasion-card__img"
              sizes="(max-width: 768px) 85vw, 20vw"
              unoptimized
            />
            <div className="rongonaa-occasion-card__shade" />
            <div className="rongonaa-occasion-card__info">
              <span className="rongonaa-occasion-card__rule" aria-hidden />
              <h3 className="rongonaa-occasion-card__name">{o.title}</h3>
              {o.description ? (
                <p className="rongonaa-occasion-card__copy">{o.description}</p>
              ) : null}
              <span className="rongonaa-occasion-card__cta">
                Explore <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="rongonaa-occasion-pager" role="tablist" aria-label="Occasions">
          {items.map((o, i) => (
            <button
              key={`${o.title}-dot-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={o.title}
              className={`rongonaa-occasion-dot${i === active ? " is-active" : ""}`}
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

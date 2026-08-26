"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type TEmotionItem = {
  name: string;
  bangla: string;
  copy: string;
  href: string;
  image: string;
};

export default function GirlsEmotionGrid({ items }: { items: TEmotionItem[] }) {
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
    <div className="rongonaa-emotion">
      <div
        ref={trackRef}
        className="rongonaa-emotion-grid"
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
        {items.map((e, i) => (
          <Link key={e.name} href={e.href} className="rongonaa-emotion-card">
            <Image
              src={e.image}
              alt={e.name}
              fill
              className="rongonaa-emotion-card__img"
              sizes="(max-width: 768px) 85vw, 20vw"
              unoptimized
            />
            <div className="rongonaa-emotion-card__shade" />
            <span className="rongonaa-emotion-card__index" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="rongonaa-emotion-card__info">
              <p className="rongonaa-emotion-card__bangla">{e.bangla}</p>
              <span className="rongonaa-emotion-card__rule" aria-hidden />
              <h3 className="rongonaa-emotion-card__name">{e.name}</h3>
              <p className="rongonaa-emotion-card__copy">{e.copy}</p>
              <span className="rongonaa-emotion-card__cta">
                Feel it <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="rongonaa-emotion-pager" role="tablist" aria-label="Moods">
          {items.map((e, i) => (
            <button
              key={`${e.name}-dot`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={e.name}
              className={`rongonaa-emotion-dot${i === active ? " is-active" : ""}`}
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

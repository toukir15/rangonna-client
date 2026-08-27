"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TBannerSlide } from "./getBannerData";

type HeroProps = {
  desktopSlides: TBannerSlide[];
  mobileSlides: TBannerSlide[];
};

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

function HeroCarousel({
  slides,
  variant,
}: {
  slides: TBannerSlide[];
  variant: "mobile" | "desktop";
}) {
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const deltaX = useRef(0);
  const dragging = useRef(false);

  const go = useCallback((i: number) => setIndex(i), []);
  const next = useCallback(() => {
    setIndex((i) => (slides.length ? (i + 1) % slides.length : 0));
  }, [slides.length]);
  const prev = useCallback(() => {
    setIndex((i) =>
      slides.length ? (i - 1 + slides.length) % slides.length : 0
    );
  }, [slides.length]);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next, slides.length, index]);

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (slides.length < 2) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    dragging.current = true;
    startX.current = e.clientX;
    deltaX.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    deltaX.current = e.clientX - startX.current;
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const moved = deltaX.current;
    deltaX.current = 0;
    if (moved < -40) next();
    else if (moved > 40) prev();
  };

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  const ctaHref = slide.link || "/churi";
  const ctaClass = "rongonaa-hero__cta rongonaa-hero__cta--primary";

  return (
    <section
      className={`rongonaa-hero rongonaa-hero--${variant}`}
      aria-label="Featured collections"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {slides.map((s, i) => (
        <div
          key={`${variant}-${s.src}-${i}`}
          className={`rongonaa-hero__slide${i === index ? " is-active" : ""}`}
          aria-hidden={i !== index}
        >
          <Image
            src={s.src}
            alt={s.headline || `Banner ${i + 1}`}
            fill
            priority={i === 0}
            className="rongonaa-hero__img object-center"
            sizes="100vw"
            unoptimized
          />
        </div>
      ))}

      <div className="rongonaa-hero__wash" aria-hidden />
      <div className="rongonaa-hero__wash-bottom" aria-hidden />

      <div className="rongonaa-hero__content">
        <div className="rongonaa-hero__inner">
          <div className="rongonaa-hero__copy">
            {slide.headline ? (
              <h1 className="rongonaa-hero__headline">{slide.headline}</h1>
            ) : null}

            {slide.copy ? (
              <p className="rongonaa-hero__desc">{slide.copy}</p>
            ) : null}

            <div className="rongonaa-hero__actions">
              {isExternal(ctaHref) ? (
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ctaClass}
                >
                  Shop Now
                  <span aria-hidden>→</span>
                </a>
              ) : (
                <Link href={ctaHref} className={ctaClass}>
                  Shop Now
                  <span aria-hidden>→</span>
                </Link>
              )}
            </div>

            {slides.length > 1 ? (
              <div className="rongonaa-hero__pager">
                {slides.map((s, i) => (
                  <button
                    key={`${variant}-${s.src}-dot-${i}`}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show slide ${i + 1}`}
                    className={`rongonaa-hero__dot${i === index ? " is-active" : ""}`}
                  />
                ))}
                <span className="rongonaa-hero__count">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Hero({ desktopSlides, mobileSlides }: HeroProps) {
  const mobile = mobileSlides.length ? mobileSlides : desktopSlides;
  const desktop = desktopSlides.length ? desktopSlides : mobileSlides;

  if (!mobile.length && !desktop.length) return null;

  return (
    <>
      {mobile.length ? (
        <HeroCarousel slides={mobile} variant="mobile" />
      ) : null}
      {desktop.length ? (
        <HeroCarousel slides={desktop} variant="desktop" />
      ) : null}
    </>
  );
}

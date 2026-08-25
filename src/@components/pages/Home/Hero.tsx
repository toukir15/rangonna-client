"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    src: "/hero-banner.png",
    alt: "Woman in cream saree wearing gold and plum crystal bangles",
    eyebrow: "Luxury Collection",
    headline: "Celebrate Every\nMoment with Elegance",
    copy: "Tradition meets modern beauty.",
    position: "object-[70%_center] sm:object-[68%_center]",
  },
  {
    src: "/hero-festival.png",
    alt: "Woman in plum lehenga wearing teal, gold and magenta festival bangles",
    eyebrow: "Festival Edit",
    headline: "Color, Crystal &\nQuiet Luxury",
    copy: "Glass stacks for every celebration.",
    position: "object-[72%_center] sm:object-[68%_center]",
  },
  {
    src: "/hero-bridal.png",
    alt: "Bridal hands with mehendi, pearl and gold chura on maroon zari lehenga",
    eyebrow: "Bridal Collection",
    headline: "Heirloom Beauty\nfor Her Day",
    copy: "Crafted for weddings and forever.",
    position: "object-[70%_center] sm:object-[68%_center]",
  },
] as const;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const go = useCallback((i: number) => setIndex(i), []);
  const next = useCallback(
    () => setIndex((i) => (i + 1) % slides.length),
    [],
  );

  useEffect(() => {
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section className="rongonaa-hero" aria-label="Featured collections">
      {slides.map((s, i) => (
        <div
          key={s.src}
          className={`rongonaa-hero__slide${i === index ? " is-active" : ""}`}
          aria-hidden={i !== index}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            className={`rongonaa-hero__img ${s.position}`}
            sizes="100vw"
          />
        </div>
      ))}

      <div className="rongonaa-hero__wash" aria-hidden />
      <div className="rongonaa-hero__wash-bottom" aria-hidden />

      <div className="rongonaa-hero__content">
        <div className="rongonaa-hero__inner">
          <div className="rongonaa-hero__copy">
            <div className="rongonaa-hero__eyebrow-row">
              <span className="rongonaa-hero__eyebrow-line" aria-hidden />
              <p className="rongonaa-hero__eyebrow">{slide.eyebrow}</p>
            </div>

            <h1 className="rongonaa-hero__headline">{slide.headline}</h1>
            <p className="rongonaa-hero__desc">{slide.copy}</p>

            <div className="rongonaa-hero__actions">
              <Link
                href="/churi"
                className="rongonaa-hero__cta rongonaa-hero__cta--primary"
              >
                Shop Now
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/churi/bridal"
                className="rongonaa-hero__cta rongonaa-hero__cta--ghost"
              >
                Bridal
              </Link>
            </div>

            <div className="rongonaa-hero__pager">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show ${s.eyebrow}`}
                  className={`rongonaa-hero__dot${i === index ? " is-active" : ""}`}
                />
              ))}
              <span className="rongonaa-hero__count">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

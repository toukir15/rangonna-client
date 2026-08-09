"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    src: "/hero-banner.png",
    alt: "Woman wearing Rangonaa ivory and gold glass bangles",
    eyebrow: "Luxury Collection",
    headline: "Celebrate Every Moment with Elegance",
    copy: "Handcrafted women's bangles that blend tradition with modern beauty.",
    position: "object-[78%_center] sm:object-[72%_center]",
  },
  {
    src: "/hero-festival.png",
    alt: "Woman wearing vibrant multicolor crystal festival bangles",
    eyebrow: "Festival Edit",
    headline: "Color, Crystal & Quiet Luxury",
    copy: "Vibrant glass stacks lined with champagne crystal for every celebration.",
    position: "object-[80%_center] sm:object-[70%_center]",
  },
  {
    src: "/hero-bridal.png",
    alt: "Bride wearing ivory and rose-gold bridal bangles with mehendi",
    eyebrow: "Bridal Collection",
    headline: "Heirloom Beauty for Her Day",
    copy: "Soft ivory and rose-gold stacks crafted for weddings and forever memories.",
    position: "object-[82%_center] sm:object-[75%_center]",
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

            <div className="rongonaa-hero__brand">
              <Image
                src="/logo-rangonaa.png"
                alt="Rangonaa"
                fill
                priority
                className="object-contain object-left"
                sizes="(max-width: 640px) 288px, 416px"
              />
            </div>

            <h1 className="rongonaa-hero__headline">{slide.headline}</h1>
            <p className="rongonaa-hero__desc">{slide.copy}</p>

            <div className="rongonaa-hero__actions">
              <Link
                href="/churi"
                className="rongonaa-hero__cta rongonaa-hero__cta--primary"
              >
                Shop Best Sellers
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/churi/bridal"
                className="rongonaa-hero__cta rongonaa-hero__cta--ghost"
              >
                Bridal Collection
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

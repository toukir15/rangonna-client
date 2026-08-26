"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TFeaturedCollectionItem } from "./getFeaturedCollectionData";

function CollectionTile({
  title,
  copy,
  image,
  link,
  index,
  large,
}: {
  title: string;
  copy: string;
  image: string;
  link: string;
  index: number;
  large?: boolean;
}) {
  return (
    <Link
      href={link || "/churi"}
      className={`rongonaa-feat-tile${large ? " rongonaa-feat-tile--large" : ""}`}
    >
      <Image
        src={image}
        alt={title}
        fill
        priority={index === 0}
        className="rongonaa-feat-tile__img"
        sizes={
          large
            ? "(max-width: 1023px) 100vw, 50vw"
            : "(max-width: 1023px) 50vw, 25vw"
        }
        style={{ objectFit: "cover", objectPosition: "center" }}
        unoptimized
      />

      <div
        className={`rongonaa-feat-tile__shade${
          large ? " rongonaa-feat-tile__shade--large" : ""
        }`}
      />
      <div className="rongonaa-feat-tile__glow" />

      <span className="rongonaa-feat-tile__index" aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="rongonaa-feat-tile__info">
        <span className="rongonaa-feat-tile__accent" aria-hidden />
        <h3 className="rongonaa-feat-tile__name">{title}</h3>
        {copy ? <p className="rongonaa-feat-tile__blurb">{copy}</p> : null}
        <span className="rongonaa-feat-tile__cta">
          Explore
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

export default function FeaturedCollectionGrid({
  mobile,
  desktop,
}: {
  mobile: TFeaturedCollectionItem[];
  desktop: TFeaturedCollectionItem[];
}) {
  const [isMobile, setIsMobile] = useState(false);

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

  if (!items.length) return null;

  return (
    <div className="rongonaa-feat-collections__grid">
      {items.map((c, i) => (
        <CollectionTile
          key={`${c.title}-${i}`}
          title={c.title}
          copy={c.description}
          image={c.image}
          link={c.link}
          index={i}
          large={c.large}
        />
      ))}
    </div>
  );
}

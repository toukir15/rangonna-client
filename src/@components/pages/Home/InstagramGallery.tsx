import Image from "next/image";
import SectionHeader from "./SectionHeader";
import { getInstagramGalleryData } from "./getInstagramGalleryData";

export default async function InstagramGallery() {
  const gallery = await getInstagramGalleryData();
  if (!gallery?.items.length) return null;

  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow={gallery.eyebrow}
          title={gallery.heading}
          description={gallery.description}
          align="center"
          href={gallery.href}
          linkLabel={gallery.linkLabel}
        />

        <div className="rongonaa-ig-grid">
          {gallery.items.map((item, i) => (
            <a
              key={`${item.src}-${i}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={`rongonaa-ig-card${i === 0 ? " rongonaa-ig-card--hero" : ""}`}
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                className="rongonaa-ig-card__img"
                sizes={i === 0 ? "(max-width: 767px) 100vw, 20vw" : "(max-width: 767px) 50vw, 20vw"}
              />
              <div className="rongonaa-ig-card__overlay">
                <span className="rongonaa-ig-card__label">{item.label}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

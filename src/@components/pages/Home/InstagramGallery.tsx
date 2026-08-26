import Image from "next/image";
import SectionHeader from "./SectionHeader";

const imgs = [
  { src: "/hero-bridal.png", label: "Bridal edit" },
  { src: "/hero-festival.png", label: "Festival color" },
  { src: "/pearl-gold-bangles.png", label: "Everyday glow" },
  { src: "/crystal-multicolor-bangles.png", label: "Crystal stack" },
  { src: "/hero-banner.png", label: "Quiet luxury" },
];

export default function InstagramGallery() {
  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow="@rangonaa"
          title="On Instagram"
          description="Moments from her wardrobe — stacks, celebrations, and everyday elegance."
          align="center"
          href="https://instagram.com"
          linkLabel="Follow @rangonaa"
        />

        <div className="rongonaa-ig-grid">
          {imgs.map((item, i) => (
            <a
              key={`${item.src}-${i}`}
              href="https://instagram.com"
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

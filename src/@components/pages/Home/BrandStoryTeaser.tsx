import Image from "next/image";
import Link from "next/link";
import Icon from "@/@components/core/Icon/Icon";

const values = [
  {
    icon: "auto_awesome",
    label: "Handcrafted",
    text: "Every set finished by hand",
  },
  {
    icon: "favorite",
    label: "For Her",
    text: "Women's bangles only",
  },
  {
    icon: "diamond",
    label: "Boutique",
    text: "Premium curated quality",
  },
] as const;

export default function BrandStoryTeaser() {
  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner rongonaa-brand-story">
        <div className="rongonaa-brand-story__media-wrap">
          <div className="rongonaa-brand-story__frame" aria-hidden />
          <div className="rongonaa-brand-story__corner rongonaa-brand-story__corner--tl" aria-hidden />
          <div className="rongonaa-brand-story__corner rongonaa-brand-story__corner--br" aria-hidden />

          <div className="rongonaa-brand-story__media">
            <Image
              src="/hero-bridal.png"
              alt="Rangonaa craftsmanship"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            <div className="rongonaa-brand-story__media-shade" />
          </div>

          <div className="rongonaa-brand-story__badge">
            <p className="rongonaa-brand-story__badge-eyebrow">Est. with care</p>
            <p className="rongonaa-brand-story__badge-title">Tradition, refined</p>
          </div>
        </div>

        <div className="rongonaa-brand-story__copy">
          <p className="rongonaa-brand-story__eyebrow">Our Story</p>
          <h2 className="rongonaa-brand-story__title">
            Modern Bengali elegance, handcrafted for her
          </h2>
          <span className="rongonaa-brand-story__rule" aria-hidden />
          <p className="rongonaa-brand-story__text">
            Rangonaa is devoted solely to women&apos;s bangles — glass, bridal,
            daily, and luxury collections that honor tradition with a refined,
            contemporary finish.
          </p>

          <ul className="rongonaa-brand-story__values">
            {values.map((v, i) => (
              <li
                key={v.label}
                className={`rongonaa-brand-story__value${
                  i > 0 ? " rongonaa-brand-story__value--divided" : ""
                }`}
              >
                <span className="rongonaa-brand-story__value-icon" aria-hidden>
                  <Icon name={v.icon} size={16} variant="outlined" />
                </span>
                <div>
                  <p className="rongonaa-brand-story__value-label">{v.label}</p>
                  <p className="rongonaa-brand-story__value-text">{v.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/about" className="rongonaa-brand-story__cta">
            About Rangonaa
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

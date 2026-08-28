import Image from "next/image";
import Link from "next/link";
import Icon from "@/@components/core/Icon/Icon";
import { getBrandStoryData } from "./getBrandStoryData";

export default async function BrandStoryTeaser() {
  const story = await getBrandStoryData();
  if (!story) return null;

  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner rongonaa-brand-story">
        <div className="rongonaa-brand-story__media-wrap">
          <div className="rongonaa-brand-story__frame" aria-hidden />
          <div className="rongonaa-brand-story__corner rongonaa-brand-story__corner--tl" aria-hidden />
          <div className="rongonaa-brand-story__corner rongonaa-brand-story__corner--br" aria-hidden />

          <div className="rongonaa-brand-story__media">
            <Image
              src={story.mobileImage}
              alt={story.imageAlt}
              fill
              className="rongonaa-brand-story__media-img rongonaa-brand-story__media-img--mobile object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            <Image
              src={story.desktopImage}
              alt={story.imageAlt}
              fill
              className="rongonaa-brand-story__media-img rongonaa-brand-story__media-img--desktop object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            <div className="rongonaa-brand-story__media-shade" />
          </div>

          <div className="rongonaa-brand-story__badge">
            <p className="rongonaa-brand-story__badge-eyebrow">{story.badgeEyebrow}</p>
            <p className="rongonaa-brand-story__badge-title">{story.badgeTitle}</p>
          </div>
        </div>

        <div className="rongonaa-brand-story__copy">
          <p className="rongonaa-brand-story__eyebrow">{story.eyebrow}</p>
          <h2 className="rongonaa-brand-story__title">{story.heading}</h2>
          <span className="rongonaa-brand-story__rule" aria-hidden />
          <p className="rongonaa-brand-story__text">{story.description}</p>

          <ul className="rongonaa-brand-story__values">
            {story.values.map((v, i) => (
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

          <Link href={story.ctaHref} className="rongonaa-brand-story__cta">
            {story.ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

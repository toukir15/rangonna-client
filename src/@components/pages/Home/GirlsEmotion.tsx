import Image from "next/image";
import Link from "next/link";
import SectionHeader from "./SectionHeader";

const emotions = [
  {
    name: "Joy",
    bangla: "আনন্দ",
    copy: "Bright stacks for her happiest days",
    href: "/watches/festival",
    image: "/hero-festival.png",
  },
  {
    name: "Grace",
    bangla: "লাবণ্য",
    copy: "Soft glass for quiet elegance",
    href: "/watches/glass-bangles",
    image: "/pearl-gold-bangles.png",
  },
  {
    name: "Romance",
    bangla: "প্রেম",
    copy: "Bridal heirloom for forever vows",
    href: "/watches/bridal",
    image: "/hero-bridal.png",
  },
  {
    name: "Confidence",
    bangla: "আত্মবিশ্বাস",
    copy: "Statement crystal she can’t ignore",
    href: "/watches/premium-churi",
    image: "/crystal-multicolor-bangles.png",
  },
  {
    name: "Desire",
    bangla: "আকর্ষণ",
    copy: "Couture gold for nights that linger",
    href: "/watches/luxury",
    image: "/hero-banner.png",
  },
] as const;

export default function GirlsEmotion() {
  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow="Wear how she feels"
          title="Girls Emotion"
          description="Shop by mood — every churi set named for the feeling she carries."
          href="/watches"
          linkLabel="Shop all moods"
        />

        <div className="rongonaa-emotion-grid">
          {emotions.map((e, i) => (
            <Link key={e.name} href={e.href} className="rongonaa-emotion-card">
              <Image
                src={e.image}
                alt={e.name}
                fill
                className="rongonaa-emotion-card__img"
                sizes="(max-width: 768px) 50vw, 20vw"
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
      </div>
    </section>
  );
}

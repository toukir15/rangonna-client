import Image from "next/image";
import Link from "next/link";
import SectionHeader from "./SectionHeader";

const occasions = [
  {
    href: "/churi/bridal",
    name: "Bridal",
    copy: "Heirloom stacks for her day",
    image: "/hero-bridal.png",
  },
  {
    href: "/churi/festival",
    name: "Festival",
    copy: "Eid, Puja & celebration color",
    image: "/hero-festival.png",
  },
  {
    href: "/churi/glass-bangles",
    name: "Daily Wear",
    copy: "Soft luxury for every day",
    image: "/pearl-gold-bangles.png",
  },
  {
    href: "/churi/premium-churi",
    name: "Party",
    copy: "Sparkle for nights out",
    image: "/crystal-multicolor-bangles.png",
  },
  {
    href: "/churi/luxury",
    name: "Gift for Her",
    copy: "Thoughtful sets she’ll love",
    image: "/hero-banner.png",
  },
] as const;

export default function ShopByOccasion() {
  return (
    <section className="rongonaa-home-section rongonaa-home-section--alt">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow="Shop by moment"
          title="Shop by Occasion"
          description="Find the perfect churi set for weddings, festivals, gifts, and everyday elegance."
          align="center"
        />

        <div className="rongonaa-occasion-grid">
          {occasions.map((o) => (
            <Link key={o.name} href={o.href} className="rongonaa-occasion-card">
              <Image
                src={o.image}
                alt={o.name}
                fill
                className="rongonaa-occasion-card__img"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              <div className="rongonaa-occasion-card__shade" />
              <div className="rongonaa-occasion-card__info">
                <span className="rongonaa-occasion-card__rule" aria-hidden />
                <h3 className="rongonaa-occasion-card__name">{o.name}</h3>
                <p className="rongonaa-occasion-card__copy">{o.copy}</p>
                <span className="rongonaa-occasion-card__cta">
                  Explore <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

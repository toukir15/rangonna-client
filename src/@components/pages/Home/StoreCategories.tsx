import Image from "next/image";
import Link from "next/link";
import SectionHeader from "./SectionHeader";

/**
 * Layout + images match /rangonaa FeaturedCollections exactly
 * so object-fit cover crops the same way.
 */
const leftColumn = [
  {
    slug: "bridal",
    name: "Bridal",
    copy: "Heirloom stacks for her forever day",
    image: "/hero-bridal.png",
    large: true,
  },
  {
    slug: "glass-bangles",
    name: "Glass Bangles",
    copy: "Translucent brilliance for every day",
    image: "/pearl-gold-bangles.png",
  },
] as const;

const rightColumn = [
  {
    slug: "luxury",
    name: "Luxury",
    copy: "Couture glass & champagne gold",
    image: "/hero-banner.png",
  },
  {
    slug: "festival",
    name: "Festival",
    copy: "Color for every celebration",
    image: "/hero-festival.png",
  },
  {
    slug: "premium-churi",
    name: "Premium Churi",
    copy: "Crystal-lined statement sets",
    image: "/crystal-multicolor-bangles.png",
  },
] as const;

function CollectionTile({
  slug,
  name,
  copy,
  image,
  index,
  large,
}: {
  slug: string;
  name: string;
  copy: string;
  image: string;
  index: number;
  large?: boolean;
}) {
  return (
    <Link
      href={`/churi/${encodeURIComponent(slug)}`}
      className={`rongonaa-feat-tile${large ? " rongonaa-feat-tile--large" : ""}`}
    >
      <Image
        src={image}
        alt={name}
        fill
        priority={index === 0}
        className="rongonaa-feat-tile__img"
        sizes={
          large
            ? "(max-width: 1024px) 100vw, 50vw"
            : "(max-width: 1024px) 50vw, 25vw"
        }
        style={{ objectFit: "cover", objectPosition: "center" }}
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
        <h3 className="rongonaa-feat-tile__name">{name}</h3>
        <p className="rongonaa-feat-tile__blurb">{copy}</p>
        <span className="rongonaa-feat-tile__cta">
          Explore
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

export default function StoreCategories() {
  return (
    <section
      className="rongonaa-feat-collections"
      aria-labelledby="featured-collections-heading"
    >
      <div className="rongonaa-feat-collections__inner">
        <SectionHeader
          eyebrow="Curated for you"
          title="Featured Collections"
          description="Five signature edits — bridal, glass, luxury, festival, and premium churi."
          href="/churi"
          linkLabel="View all collections"
        />

        <div className="rongonaa-feat-collections__grid">
          <div className="rongonaa-feat-collections__col rongonaa-feat-collections__col--left">
            {leftColumn.map((c, i) => (
              <CollectionTile
                key={c.slug}
                slug={c.slug}
                name={c.name}
                copy={c.copy}
                image={c.image}
                index={i}
                large={"large" in c && c.large}
              />
            ))}
          </div>

          <div className="rongonaa-feat-collections__col rongonaa-feat-collections__col--right">
            {rightColumn.map((c, i) => (
              <CollectionTile
                key={c.slug}
                slug={c.slug}
                name={c.name}
                copy={c.copy}
                image={c.image}
                index={i + 2}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

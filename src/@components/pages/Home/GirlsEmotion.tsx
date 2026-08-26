import SectionHeader from "./SectionHeader";
import GirlsEmotionGrid from "./GirlsEmotionGrid";

const emotions = [
  {
    name: "Joy",
    bangla: "আনন্দ",
    copy: "Bright stacks for her happiest days",
    href: "/churi/festival",
    image: "/hero-festival.png",
  },
  {
    name: "Grace",
    bangla: "লাবণ্য",
    copy: "Soft glass for quiet elegance",
    href: "/churi/glass-bangles",
    image: "/pearl-gold-bangles.png",
  },
  {
    name: "Romance",
    bangla: "প্রেম",
    copy: "Bridal heirloom for forever vows",
    href: "/churi/bridal",
    image: "/hero-bridal.png",
  },
  {
    name: "Confidence",
    bangla: "আত্মবিশ্বাস",
    copy: "Statement crystal she can’t ignore",
    href: "/churi/premium-churi",
    image: "/crystal-multicolor-bangles.png",
  },
  {
    name: "Desire",
    bangla: "আকর্ষণ",
    copy: "Couture gold for nights that linger",
    href: "/churi/luxury",
    image: "/hero-banner.png",
  },
];

export default function GirlsEmotion() {
  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow="Wear how she feels"
          title="Girls Emotion"
          description="Shop by mood — every churi set named for the feeling she carries."
          href="/churi"
          linkLabel="Shop all moods"
        />

        <GirlsEmotionGrid items={emotions} />
      </div>
    </section>
  );
}

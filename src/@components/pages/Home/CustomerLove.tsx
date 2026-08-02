import Image from "next/image";
import SectionHeader from "./SectionHeader";

const reviews = [
  {
    name: "Nusrat A.",
    city: "Dhaka",
    rating: 5,
    text: "The bridal set looked even more beautiful in person. Packaging was gift-ready and COD was smooth.",
    image: "/hero-bridal.png",
    product: "Bridal Ivory Heritage",
  },
  {
    name: "Farhana K.",
    city: "Chittagong",
    rating: 5,
    text: "Ordered the festival stack for Puja — colors are rich and the crystals catch light so well.",
    image: "/hero-festival.png",
    product: "Crystal Festival Stack",
  },
  {
    name: "Samira R.",
    city: "Sylhet",
    rating: 5,
    text: "Daily wear set is lightweight and elegant. Delivery across BD was faster than expected.",
    image: "/pearl-gold-bangles.png",
    product: "Daily Rose Whisper",
  },
  {
    name: "Meher T.",
    city: "Rajshahi",
    rating: 4,
    text: "Quality feels premium. Exchanged size easily via WhatsApp — very helpful team.",
    image: "/hero-banner.png",
    product: "Premium Churi Aura",
  },
  {
    name: "Anika S.",
    city: "Khulna",
    rating: 5,
    text: "Gift packaging was beautiful. My sister loved the soft gold stack — will order again.",
    image: "/crystal-multicolor-bangles.png",
    product: "Soft Gold Whisper",
  },
];

export default function CustomerLove() {
  return (
    <section className="rongonaa-home-section rongonaa-home-section--alt rongonaa-home-section--border">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow="Social proof"
          title="Loved by Her"
          description="Real customers across Bangladesh — handcrafted churi, delivered with care."
          align="center"
        />

        <div className="rongonaa-reviews-grid">
          {reviews.map((r) => (
            <article key={r.name} className="rongonaa-review-card">
              <div className="rongonaa-review-card__media">
                <Image
                  src={r.image}
                  alt={r.product}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>

              <div className="rongonaa-review-card__stars" aria-label={`${r.rating} of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`rongonaa-review-card__star${
                      i < r.rating ? " is-filled" : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="rongonaa-review-card__text">“{r.text}”</p>

              <div className="rongonaa-review-card__meta">
                <p className="rongonaa-review-card__name">{r.name}</p>
                <p className="rongonaa-review-card__sub">
                  {r.city} · {r.product}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

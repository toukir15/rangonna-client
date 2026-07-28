import Image from "next/image";
import Link from "next/link";
import { ENV } from "@/@config/env.config";
import {
  IStoreProductCategory,
  IStoreProductCategoryListResponse,
} from "@/@interfaces/ProductCategory/productCategory.interface";

export const revalidate = 30;

const CARD_SLOTS = ["hero", "side-a", "side-b", "bottom-a", "bottom-b"] as const;

async function getProductCategories(): Promise<IStoreProductCategory[]> {
  const qs = new URLSearchParams({
    limit: "5",
    page: "1",
    sort: "key",
  });

  const rawUrl = `${ENV.ApiEndpoint?.trim()}/product-category?${qs}`;
  const url = encodeURI(rawUrl);

  try {
    const res = await fetch(url, {
      next: { revalidate: 30, tags: ["product-category"] },
    });

    if (!res.ok) {
      console.error("❌ product-category API ERROR:", res.status);
      return [];
    }

    const json: IStoreProductCategoryListResponse & {
      data?: IStoreProductCategory[] | { data?: IStoreProductCategory[] };
    } = await res.json();

    if (!json?.success) return [];

    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.data?.data)) return json.data.data;

    return [];
  } catch (err) {
    console.error("❌ product-category FETCH FAILED:", err);
    return [];
  }
}

export default async function StoreCategories() {
  const categories = (await getProductCategories()).slice(0, 5);

  if (!categories.length) return null;

  const names = categories.map((c) => (c.key || c.value || "").trim()).filter(Boolean);
  const subtitle =
    names.length > 1
      ? `Signature edits — ${names.join(", ").toLowerCase()}.`
      : "Curated collections for every moment.";

  return (
    <section
      className="rongonaa-store-categories"
      aria-labelledby="store-categories-heading"
    >
      <div className="rongonaa-store-categories__inner">
        <div className="rongonaa-store-categories__header">
          <div>
            <h2
              id="store-categories-heading"
              className="rongonaa-store-categories__title"
            >
              Shop by Category
            </h2>
            <span className="rongonaa-store-categories__rule" aria-hidden />
            <p className="rongonaa-store-categories__desc">{subtitle}</p>
          </div>

          <Link href="/watches" className="rongonaa-store-categories__view-all">
            View all collections
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div
          className={`rongonaa-store-categories__grid${
            categories.length === 5
              ? " rongonaa-store-categories__grid--mosaic"
              : ""
          }`}
        >
          {categories.map((item, index) => {
            const slug = (item.value || "").trim();
            const title = (item.key || slug || "Category").trim();
            const href = slug ? `/watches/${encodeURIComponent(slug)}` : "#";
            const imageSrc = item.image?.src?.trim();
            const imageAlt = item.image?.alt || item.image?.title || title;
            const slot = CARD_SLOTS[index] ?? "bottom-b";
            const isAccent = slot === "side-a";

            return (
              <Link
                key={item._id || slug || title}
                href={href}
                className={`rongonaa-store-categories__card rongonaa-store-categories__card--${slot}`}
              >
                <div className="rongonaa-store-categories__media">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      className="rongonaa-store-categories__img"
                      sizes={
                        slot === "hero"
                          ? "(max-width: 768px) 100vw, 45vw"
                          : "(max-width: 768px) 100vw, 50vw"
                      }
                    />
                  ) : (
                    <div
                      className="rongonaa-store-categories__placeholder"
                      aria-hidden
                    >
                      {title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="rongonaa-store-categories__shade" />
                </div>

                <span className="rongonaa-store-categories__index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="rongonaa-store-categories__info">
                  <span className="rongonaa-store-categories__accent" aria-hidden />
                  <h3 className="rongonaa-store-categories__name">{title}</h3>
                  <p className="rongonaa-store-categories__blurb">
                    Explore the {title} collection
                  </p>
                  <span
                    className={`rongonaa-store-categories__cta${
                      isAccent ? " rongonaa-store-categories__cta--solid" : ""
                    }`}
                  >
                    Explore
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

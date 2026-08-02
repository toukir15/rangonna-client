import Image from "next/image";
import Link from "next/link";
import { ENV } from "@/@config/env.config";
import {
  IStoreProductCategory,
  IStoreProductCategoryListResponse,
} from "@/@interfaces/ProductCategory/productCategory.interface";
import SectionHeader from "./SectionHeader";

export const revalidate = 30;

const COPY: Record<string, string> = {
  bridal: "Heirloom stacks for her forever day",
  "glass-bangles": "Translucent brilliance for every day",
  luxury: "Couture glass & champagne gold",
  festival: "Color for every celebration",
  "premium-churi": "Crystal-lined statement sets",
};

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

function CollectionTile({
  item,
  index,
  large,
}: {
  item: IStoreProductCategory;
  index: number;
  large?: boolean;
}) {
  const slug = (item.value || "").trim();
  const title = (item.key || slug || "Category").trim();
  const href = slug ? `/watches/${encodeURIComponent(slug)}` : "#";
  const imageSrc = item.image?.src?.trim();
  const imageAlt = item.image?.alt || item.image?.title || title;
  const copy =
    COPY[slug] || `Explore the ${title.toLowerCase()} collection`;

  return (
    <Link
      href={href}
      className={`rongonaa-feat-tile${large ? " rongonaa-feat-tile--large" : ""}`}
    >
      <div className="rongonaa-feat-tile__media">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={index === 0}
            className="rongonaa-feat-tile__img"
            sizes={
              large
                ? "(max-width: 1024px) 100vw, 50vw"
                : "(max-width: 1024px) 50vw, 25vw"
            }
          />
        ) : (
          <div className="rongonaa-feat-tile__placeholder" aria-hidden>
            {title.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="rongonaa-feat-tile__shade" />
        <div className="rongonaa-feat-tile__glow" />
      </div>

      <span className="rongonaa-feat-tile__index" aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="rongonaa-feat-tile__info">
        <span className="rongonaa-feat-tile__accent" aria-hidden />
        <h3 className="rongonaa-feat-tile__name">{title}</h3>
        <p className="rongonaa-feat-tile__blurb">{copy}</p>
        <span className="rongonaa-feat-tile__cta">
          Explore
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

export default async function StoreCategories() {
  const categories = (await getProductCategories()).slice(0, 5);
  if (!categories.length) return null;

  const left = categories.slice(0, 2);
  const right = categories.slice(2, 5);

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
          href="/watches"
          linkLabel="View all collections"
        />

        <div className="rongonaa-feat-collections__grid">
          <div className="rongonaa-feat-collections__col rongonaa-feat-collections__col--left">
            {left.map((item, i) => (
              <CollectionTile
                key={item._id || item.value || item.key}
                item={item}
                index={i}
                large={i === 0}
              />
            ))}
          </div>

          <div className="rongonaa-feat-collections__col rongonaa-feat-collections__col--right">
            {right.map((item, i) => (
              <CollectionTile
                key={item._id || item.value || item.key}
                item={item}
                index={i + 2}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

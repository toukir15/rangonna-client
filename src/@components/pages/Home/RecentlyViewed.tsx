"use client";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import WatchCard from "../Watches/WatchCard";
import SectionHeader from "./SectionHeader";
import { IProduct } from "@/@interfaces/common.interface";
import { ProductService } from "@/@services/apis/Product/Product.service";

type RecentItem = { id?: string; slug?: string };

export default function RecentlyViewed() {
  const [products, setProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const raw = getCookie("recentlyViewed");
        if (!raw) return;
        const parsed = JSON.parse(String(raw)) as RecentItem[];
        const slugs = (Array.isArray(parsed) ? parsed : [])
          .map((p) => p?.slug)
          .filter(Boolean)
          .slice(0, 5) as string[];
        if (!slugs.length) return;

        const results = await Promise.all(
          slugs.map(async (slug) => {
            try {
              const res = await ProductService.getSingleProduct(slug);
              return (res?.data ?? null) as IProduct | null;
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) {
          setProducts(results.filter(Boolean) as IProduct[]);
        }
      } catch {
        /* ignore */
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!products.length) return null;

  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner">
        <SectionHeader eyebrow="Continue browsing" title="Recently Viewed" />
        <div className="rongonaa-flash-sale__grid">
          {products.map((p) => (
            <WatchCard
              key={p._id}
              data={p}
              isAddToCartButton={false}
              isByNowButton
            />
          ))}
        </div>
      </div>
    </section>
  );
}

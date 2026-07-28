import Link from "next/link";
import { IProduct } from "@/@interfaces/common.interface";
import DayDealCount from "../DayDealCount/DayDealCount";
import FlashSaleCard from "./FlashSaleCard";
import { ENV } from "@/@config/env.config";

export const revalidate = 10;

async function getProducts() {
  const qs = new URLSearchParams({
    limit: "10",
    category: "flash-sale",
    sort: "-updatedAt",
    "inventory.stock_status": "in-stock",
  });

  const rawUrl = `${ENV.ApiEndpoint?.trim()}/product?${qs}`;
  const url = encodeURI(rawUrl);

  try {
    const res = await fetch(url, {
      next: { revalidate: 10, tags: ["products", "flash-sale"] },
    });

    if (!res.ok) {
      console.error("❌ API ERROR:", res.status);
      return { data: { data: [] } };
    }

    return res.json();
  } catch (err) {
    console.error("❌ FETCH FAILED:", err);
    return { data: { data: [] } };
  }
}

export default async function BestOffersPage() {
  const response = await getProducts();
  const products: IProduct[] = (response?.data?.data ?? []).filter(
    (w: IProduct) => w?.inventory?.stock_status !== "out-of-stock",
  );

  if (products.length === 0) return null;

  return (
    <section
      className="rongonaa-flash-sale mt-3"
      aria-labelledby="flash-sale-heading"
    >
      <div className="rongonaa-flash-sale__inner">
        <div className="rongonaa-flash-sale__header">
          <div>
            <p className="rongonaa-flash-sale__eyebrow">Limited Time</p>
            <h2 id="flash-sale-heading" className="rongonaa-flash-sale__title">
              Flash Sale
            </h2>
          </div>

          <div className="rongonaa-flash-sale__aside">
            <DayDealCount />
            <Link
              href="/watches/flash-sale"
              className="rongonaa-flash-sale__view-all"
            >
              View All
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="rongonaa-flash-sale__grid">
          {products.slice(0, 5).map((data) => (
            <FlashSaleCard key={data._id} data={data} />
          ))}
        </div>
      </div>
    </section>
  );
}

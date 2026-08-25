import Link from "next/link";
import { IProduct } from "@/@interfaces/common.interface";
import DayDealCount from "../DayDealCount/DayDealCount";
import FlashSaleCard from "./FlashSaleCard";
import { ENV } from "@/@config/env.config";

export const revalidate = 10;

const FLASH_LIMIT = 5;

function parseProductList(json: unknown): IProduct[] {
  if (!json || typeof json !== "object") return [];
  const root = json as Record<string, unknown>;
  const data = root.data;

  if (Array.isArray(data)) return data as IProduct[];
  if (data && typeof data === "object") {
    const nested = (data as Record<string, unknown>).data;
    if (Array.isArray(nested)) return nested as IProduct[];
  }
  return [];
}

async function fetchFromApi(params: Record<string, string>): Promise<IProduct[]> {
  const qs = new URLSearchParams(params);
  const url = `${ENV.ApiEndpoint?.trim()}/product?${qs.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 10, tags: ["products", "flash-sale"] },
    });

    if (!res.ok) {
      console.error("❌ Flash sale API error:", res.status, url);
      return [];
    }

    return parseProductList(await res.json());
  } catch (err) {
    console.error("❌ Flash sale API fetch failed:", err);
    return [];
  }
}

/**
 * Home Flash Sale — API driven, max 5 products.
 * Primary: GET /product?category=flash-sale&limit=5
 * If fewer than 5 tagged, fill from best-selling so the grid stays full.
 */
async function getFlashSaleProducts(): Promise<IProduct[]> {
  const flash = await fetchFromApi({
    limit: String(FLASH_LIMIT),
    page: "1",
    category: "flash-sale",
    sort: "-updatedAt",
  });

  if (flash.length >= FLASH_LIMIT) {
    return flash.slice(0, FLASH_LIMIT);
  }

  const filler = await fetchFromApi({
    limit: String(FLASH_LIMIT * 2),
    page: "1",
    category: "all",
    sort: "best-selling",
  });

  const seen = new Set(flash.map((p) => String(p._id)));
  const merged = [...flash];

  for (const product of filler) {
    if (merged.length >= FLASH_LIMIT) break;
    const id = String(product._id);
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(product);
  }

  return merged.slice(0, FLASH_LIMIT);
}

export default async function BestOffersPage() {
  const products = await getFlashSaleProducts();

  if (products.length === 0) return null;

  return (
    <section className="rongonaa-home-section rongonaa-home-section--border rongonaa-home-section--flash">
      <div className="rongonaa-home-section__inner">
        <div className="rongonaa-flash-sale__header">
          <div className="rongonaa-flash-sale__heading">
            <span className="rongonaa-flash-sale__mark" aria-hidden />
            <h2 className="rongonaa-flash-sale__title">Flash Sale</h2>
          </div>

          <div className="rongonaa-flash-sale__aside">
            <DayDealCount />
            <Link
              href="/churi/flash-sale"
              className="rongonaa-flash-sale__view-all"
            >
              View All
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="rongonaa-flash-sale__grid">
          {products.map((data) => (
            <FlashSaleCard key={data._id} data={data} cta="order" />
          ))}
        </div>
      </div>
    </section>
  );
}

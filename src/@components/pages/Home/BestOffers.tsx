import { IProduct } from "@/@interfaces/common.interface";
import DayDealCount from "../DayDealCount/DayDealCount";
import WatchCard from "../Watches/WatchCard";
import { ENV } from "@/@config/env.config";

export const revalidate = 10;

// async function getProducts() {
//   const qs = new URLSearchParams({
//     limit: "18",
//     category: "flash-sale",
//     "inventory.stock_status": "in-stock",
//   });
//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product?${qs}`, {
//     next: { revalidate: 10, tags: ["products", "flash-sale"] },
//   });
//   if (!res.ok) {
//     return { data: { data: [] } };
//   }
//   return res.json();
// }

// async function getProducts() {
//   const qs = new URLSearchParams({
//     limit: "18",
//     category: "flash-sale",
//     "inventory.stock_status": "in-stock",
//   });

//   const rawUrl = `${process.env.NEXT_PUBLIC_BASE_URL?.trim()}/product?${qs}`;
//   const url = encodeURI(rawUrl);

//   const res = await fetch(url, {
//     next: { revalidate: 10, tags: ["products", "flash-sale"] },
//   });

//   if (!res.ok) {
//     return { data: { data: [] } };
//   }

//   return res.json();
// }

async function getProducts() {
  const qs = new URLSearchParams({
    limit: "18",
    category: "flash-sale",
    sort: "-updatedAt",
    "inventory.stock_status": "in-stock",
  });

  const rawUrl = `${ENV.ApiEndpoint?.trim()}/naviforce-product?${qs}`;
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
  const products: IProduct[] = response?.data?.data ?? [];

  return (
    <div>
      {products.length > 0 && (
        <div className="max-w-layout mx-auto p-3 bg-primary-light mt-5 border-primary-border border rounded-lg">
          <div className="flex gap-2 items-center ">
            <h2 className="text-2xl font-bold pb-3">Flash Sale</h2>
            <div>
              <DayDealCount />
            </div>
          </div>

          <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 xl:gap-2">
            {products
              .filter(
                (w: IProduct) => w?.inventory?.stock_status !== "out-of-stock",
              )
              .map((data: IProduct) => (
                <WatchCard
                  key={data._id}
                  data={data}
                  imgClassName="h-32 rounded-lg"
                  isAddToCartButton={false}
                  isByNowButton={true}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

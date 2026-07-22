import React from "react";
import WatchCard from "../Watches/WatchCard";
import { IProduct } from "@/@interfaces/common.interface";
import { ENV } from "@/@config/env.config";

export const revalidate = 10;
// async function getPopularProducts() {
//   const qs = new URLSearchParams({
//     limit: "20",
//     category: "all",
//     sort: "best-selling",
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

async function getPopularProducts() {
  try {
    const qs = new URLSearchParams({
      limit: "20",
      category: "all",
      sort: "best-selling",
      "inventory.stock_status": "in-stock",
    });

    const rawUrl = `${ENV.ApiEndpoint?.trim()}/naviforce-product?${qs.toString()}`;
    const safeUrl = encodeURI(rawUrl);

    const res = await fetch(safeUrl, {
      next: { revalidate: 10, tags: ["products", "popular"] },
    });

    if (!res.ok) {
      return { data: { data: [] } };
    }

    return res.json();
  } catch {
    return { data: { data: [] } };
  }
}

const PopularProduct = async () => {
  const response = await getPopularProducts();
  const products: IProduct[] = response?.data?.data ?? [];

  return (
    <div>
      {products.length > 0 && (
        <div className="max-w-layout mx-auto pt-5">
          <h2 className="text-2xl font-bold pb-5">Popular Product</h2>
          <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 xl:gap-5">
            {products
              .filter(
                (p: IProduct) => p?.inventory?.stock_status !== "out-of-stock",
              )
              .map((data: IProduct) => (
                <WatchCard
                  key={data._id}
                  data={data}
                  imgClassName="h-32 rounded-lg"
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularProduct;

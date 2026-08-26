// "use client";

// import React, { useEffect, useRef, useState, useCallback } from "react";
// import WatchCard from "../Watches/WatchCard";
// import { ProductService } from "@/@services/apis/Product/Product.service";
// import { IProduct } from "@/@interfaces/common.interface";

// const LIMIT = 20;

// const NewProduct: React.FC = () => {
//   const [products, setProducts] = useState<IProduct[]>([]);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const loaderRef = useRef<HTMLDivElement | null>(null);

//   const mergeUniqueById = useCallback(
//     (prev: IProduct[], incoming: IProduct[]) => {
//       const map = new Map(prev.map((p) => [String(p._id), p]));
//       incoming.forEach((p) => map.set(String(p._id), p));
//       return Array.from(map.values());
//     },
//     []
//   );

//   const fetchProducts = useCallback(
//     async (pageNum: number) => {
//       try {
//         setLoading(true);

//         const response = await ProductService.getProductWithCategory({
//           limit: LIMIT,
//           page: pageNum,
//           category: "all",
//           sort: "new-released",
//           "inventory.stock_status": "in-stock",
//         });

//         if (!response?.success) throw new Error("Failed to fetch products");

//         const newItems = response?.data?.data || [];
//         setProducts((prev) => mergeUniqueById(prev, newItems));
//         setHasMore(newItems.length === LIMIT);
//       } catch (e) {
//         console.error("Error fetching new arrivals:", e);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [mergeUniqueById]
//   );

//   useEffect(() => {
//     fetchProducts(page);
//   }, [page, fetchProducts]);

//   useEffect(() => {
//     if (!loaderRef.current) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && hasMore && !loading) {
//           setPage((prev) => prev + 1);
//         }
//       },
//       { threshold: 0.5 }
//     );

//     observer.observe(loaderRef.current);
//     return () => observer.disconnect();
//   }, [hasMore, loading]);

//   return (
//     <div className="max-w-layout mx-auto py-5">
//       <h2 className="text-2xl font-bold pb-5">New Arrival​</h2>

//       <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 xl:gap-5">
//         {products.map((product) => (
//           <WatchCard
//             key={product._id}
//             data={product}
//             imgClassName="h-32 rounded-lg"
//           />
//         ))}
//       </div>

//       {/* ✅ Loader & Observer Target */}
//       <div ref={loaderRef} className="flex items-center justify-center py-6">
//         {loading && (
//           <div className="flex items-center gap-2 text-gray-500 text-sm">
//             <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
//             <span className="animate-pulse">Loading more…</span>
//           </div>
//         )}
//         {!hasMore && !loading && products.length > 0 && (
//           <span className="text-sm text-gray-400">You’re all caught up.</span>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NewProduct;

import { IProduct } from "@/@interfaces/common.interface";
import NewProductLoad from "./NewProductLoad";
import { ENV } from "@/@config/env.config";

export const revalidate = 60; // ISR প্রতি 60 sec পর refresh হবে

// async function getInitialProducts(): Promise<IProduct[]> {
//   const qs = new URLSearchParams({
//     limit: "20",
//     page: "1",
//     category: "all",
//     sort: "new-released",
//     "inventory.stock_status": "in-stock",
//   });

//   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product?${qs}`, {
//     next: { revalidate: 60 },
//   });

//   if (!res.ok) {
//     console.error("Failed to fetch initial products");
//     return [];
//   }

//   const json = await res.json();
//   return json?.data?.data ?? [];
// }

async function getInitialProducts(): Promise<IProduct[]> {
  try {
    const qs = new URLSearchParams({
      limit: "6",
      page: "1",
      category: "all",
      sort: "new-released",
    });

    const rawUrl = `${ENV.ApiEndpoint?.trim()}/product?${qs}`;
    const safeUrl = encodeURI(rawUrl);

    const res = await fetch(safeUrl, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("Failed to fetch initial products");
      return [];
    }

    const json = await res.json();
    return json?.data?.data ?? [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const initialProducts = await getInitialProducts();
  return <NewProductLoad initialProducts={initialProducts} />;
}

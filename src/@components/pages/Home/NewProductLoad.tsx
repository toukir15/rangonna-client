"use client";
import { useState, useCallback } from "react";
import WatchCard from "../Watches/WatchCard";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { IProduct } from "@/@interfaces/common.interface";
import Button from "@/@components/core/Button/Button";

const LIMIT = 20;

export default function NewProductLoad({
  initialProducts,
}: {
  initialProducts: IProduct[];
}) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await ProductService.getProductWithCategory({
        limit: LIMIT,
        page: pageNum,
        category: "all",
        sort: "new-released",
        "inventory.stock_status": "in-stock",
      });

      const newItems = response?.data?.data || [];
      setProducts((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === LIMIT);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(page);
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-layout mx-auto py-5">
      <h2 className="text-2xl font-bold pb-5">New Arrival</h2>

      {/* Product Grid */}
      <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 xl:gap-5">
        {products.map((product) => (
          <WatchCard
            key={product._id}
            data={product}
            imgClassName="h-32 rounded-lg"
          />
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex items-center justify-center py-6">
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="animate-pulse">Loading…</span>
          </div>
        )}

        {!loading && hasMore && (
          <Button
            onClick={handleLoadMore}
            className=" !px-6 !py-1 bg-primary text-white rounded hover:bg-primary transition cursor-pointer"
          >
            View More Product
          </Button>
        )}

        {!hasMore && !loading && products.length > 0 && (
          <span className="text-sm text-gray-400">You’re all caught up.</span>
        )}
      </div>
    </div>
  );
}

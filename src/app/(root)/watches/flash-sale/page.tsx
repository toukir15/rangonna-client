"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductService } from "@/@services/apis/Product/Product.service";
import WatchCard from "@/@components/pages/Watches/WatchCard";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import DayDealCount from "@/@components/pages/DayDealCount/DayDealCount";
import FlashSaleWatch from "@/@skeleton/FlashSaleWatch.skeleton";
import NoDataFound from "@/@components/pages/NoDataFount/NoDataFount";
import {
  ApiResponse,
  WatchData,
} from "@/@interfaces/Watches/AllWatches/allWatches.interface";
import { IProduct } from "@/@interfaces/common.interface";

const PAGE_SIZE = 24;

export default function WomenWatches() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [watchData, setWatchData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mergeUniqueWatches = (existing: WatchData[], incoming: WatchData[]) => {
    const ids = new Set(existing.map((i) => i._id));
    return [...existing, ...incoming.filter((i) => !ids.has(i._id))];
  };

  useEffect(() => {
    const handleScroll = () => {
      const threshold = document.body.offsetHeight * 0.8;
      if (
        window.innerHeight + window.scrollY >= threshold &&
        !loading &&
        !loadingMore &&
        hasMore
      ) {
        setLimit((prev) => prev + PAGE_SIZE);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    setLimit(PAGE_SIZE);
    setWatchData(null);
    setHasMore(true);
  }, [search]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      ...{ category: "flash-sale", sort: "-updatedAt" },

      limit,
    };
    return params;
  }, [limit, search]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const isFirstPage = watchData === null || limit === PAGE_SIZE;
      isFirstPage ? setLoading(true) : setLoadingMore(true);
      setError(null);

      try {
        const res: ApiResponse = await ProductService.getProduct(queryParams);

        if (!cancelled) {
          if (res?.success) {
            const total =
              res.data?.meta?.total_record ??
              res.data?.meta?.total_records ??
              0;

            setHasMore(
              total ? limit < total : res.data.data.length >= PAGE_SIZE
            );

            setWatchData((prev) => {
              if (!prev || isFirstPage) return res;
              return {
                ...res,
                data: {
                  ...res.data,
                  data: mergeUniqueWatches(prev.data.data, res.data.data),
                },
              };
            });
          } else {
            setError("Failed to fetch products");
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Something went wrong");
      } finally {
        if (!cancelled) {
          isFirstPage ? setLoading(false) : setLoadingMore(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(queryParams)]);

  return (
    <div className="py-5 2xl:px-0 px-3">
      <div className="max-w-layout mx-auto p-3 bg-primary-light py-5 border-primary-border border rounded-lg">
        <div className="flex gap-2 items-center ">
          <h2 className="text-2xl font-bold pb-3">Flash Sale </h2>{" "}
          <div>
            <DayDealCount />
          </div>
        </div>
        <div className="flex gap-4">
          <div className=" w-full">
            {loading ? (
              <div className="flex justify-center items-center">
                <FlashSaleWatch />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-danger">{error}</p>
              </div>
            ) : watchData?.data?.data?.length ? (
              <>
                <div className="grid md:grid-cols-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 md:gap-4 gap-2 ">
                  {watchData.data.data
                    .filter(
                      (w: IProduct) =>
                        w?.inventory?.stock_status !== "out-of-stock"
                    )
                    .map((w: IProduct, idx) => (
                      <WatchCard
                        key={`${w._id}-${idx}`}
                        data={w}
                        isByNowButton={true}
                        isAddToCartButton={false}
                      />
                    ))}
                </div>

                {loadingMore && (
                  <div className="flex justify-center items-center py-4">
                    <ButtonLoader />
                  </div>
                )}

                {!hasMore && !loadingMore && (
                  <div className="flex justify-center items-center py-4">
                    <p className="text-gray-500">No more watches to load</p>
                  </div>
                )}
              </>
            ) : (
              <NoDataFound />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

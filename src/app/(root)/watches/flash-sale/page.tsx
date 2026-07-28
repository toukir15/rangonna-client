"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductService } from "@/@services/apis/Product/Product.service";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import DayDealCount from "@/@components/pages/DayDealCount/DayDealCount";
import FlashSaleCard from "@/@components/pages/Home/FlashSaleCard";
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
              total ? limit < total : res.data.data.length >= PAGE_SIZE,
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
    <section
      className="rongonaa-flash-sale min-h-[60vh]"
      aria-labelledby="flash-sale-page-heading"
    >
      <div className="rongonaa-flash-sale__inner">
        <div className="rongonaa-flash-sale__header">
          <div>
            <p className="rongonaa-flash-sale__eyebrow">Limited Time</p>
            <h2
              id="flash-sale-page-heading"
              className="rongonaa-flash-sale__title"
            >
              Flash Sale
            </h2>
          </div>

          <div className="rongonaa-flash-sale__aside">
            <DayDealCount />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <FlashSaleWatch />
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-danger">{error}</p>
          </div>
        ) : watchData?.data?.data?.length ? (
          <>
            <div className="rongonaa-flash-sale__grid">
              {watchData.data.data
                .filter(
                  (w: IProduct) =>
                    w?.inventory?.stock_status !== "out-of-stock",
                )
                .map((w: IProduct, idx) => (
                  <FlashSaleCard key={`${w._id}-${idx}`} data={w} />
                ))}
            </div>

            {loadingMore && (
              <div className="flex items-center justify-center py-6">
                <ButtonLoader />
              </div>
            )}

            {!hasMore && !loadingMore && (
              <div className="flex items-center justify-center py-6">
                <p className="text-sm text-black/40">No more products to load</p>
              </div>
            )}
          </>
        ) : (
          <NoDataFound />
        )}
      </div>
    </section>
  );
}

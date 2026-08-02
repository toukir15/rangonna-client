"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProductService } from "@/@services/apis/Product/Product.service";
import WatchCard from "@/@components/pages/Watches/WatchCard";
import Icon from "@/@components/core/Icon/Icon";
import FilterSideBar from "@/@components/pages/FilterSidebar/FilterSideBar";
import WatchSkeleton from "@/@skeleton/Watches.skeleton";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import FilterDrawer from "../../FilterDrawer/FilterDrawer";
import {
  ApiResponse,
  WatchData,
} from "@/@interfaces/Watches/AllWatches/allWatches.interface";
import NoDataFound from "../../NoDataFount/NoDataFount";
import FilterChips from "../../FilterSidebar/FilterChips";

const PAGE_SIZE = 24;
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 28500;

export default function AllWatches() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [watchData, setWatchData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX);
  const [sort, setSort] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isFilterDrawer, setIsFilterDrawer] = useState<boolean>(false);
  const [priceClear, setPriceClear] = useState<boolean>(false);

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
  }, [
    minPrice,
    maxPrice,
    JSON.stringify(sort),
    JSON.stringify(brands),
    JSON.stringify(categories),
    search,
  ]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      ...(minPrice && maxPrice
        ? { priceRange: `${minPrice}-${maxPrice}` }
        : {}),
      ...(sort.length ? { sort: sort.join(",") } : {}),
      ...(brands.length ? { brand: brands.join(",") } : {}),
      ...(categories.length
        ? { category: categories.join(",") }
        : { category: "all" }),
      ...(search ? { searchTerm: search } : {}),
      limit,
    };
    return params;
  }, [
    limit,
    minPrice,
    maxPrice,
    search,
    JSON.stringify(sort),
    JSON.stringify(brands),
    JSON.stringify(categories),
  ]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const isFirstPage = watchData === null || limit === PAGE_SIZE;
      isFirstPage ? setLoading(true) : setLoadingMore(true);
      setError(null);

      try {
        const res: ApiResponse = await ProductService.getProduct(queryParams);
        setIsFilterDrawer(false);

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
        setIsFilterDrawer(false);
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

  const hasAnyFilterActive =
    minPrice !== DEFAULT_MIN ||
    maxPrice !== DEFAULT_MAX ||
    sort.length > 0 ||
    brands.length > 0 ||
    categories.length > 0 ||
    !!search;

  const clearPrice = () => {
    setPriceClear(true);
    setMinPrice(DEFAULT_MIN);
    setMaxPrice(DEFAULT_MAX);
  };
  const clearSort = () => setSort([]);
  const clearBrand = () => setBrands([]);
  const clearCategory = (name: string) =>
    setCategories((prev) => prev.filter((c) => c !== name));
  const clearAll = () => {
    clearPrice();
    clearSort();
    clearBrand();
    setCategories([]);
  };

  return (
    <div className="max-w-layout mx-auto py-5 min-h-[47vh] 2xl:px-0 px-3">
      <div className="flex gap-4">
        <div className="xl:block hidden md:w-1/5">
          <FilterSideBar
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            sort={sort}
            setSort={setSort}
            brands={brands}
            setBrands={setBrands}
            categories={categories}
            setCategories={setCategories}
            filterCategories={"all"}
            priceClear={priceClear ?? false}
          />
        </div>

        <div className="xl:w-4/5 w-full">
          <div className="flex items-center justify-between">
            <div className="text-lg flex flex-wrap  items-center gap-1">
              <Link href="/">Home</Link> / <Link href="/watches">Watches</Link>
              <div className="ml-3 md:block hidden">
                <FilterChips
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  DEFAULT_MIN={DEFAULT_MIN}
                  DEFAULT_MAX={DEFAULT_MAX}
                  sort={sort}
                  brands={brands}
                  categories={categories}
                  clearPrice={clearPrice}
                  clearSort={clearSort}
                  clearBrand={clearBrand}
                  clearCategory={clearCategory}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              {hasAnyFilterActive && (
                <button
                  onClick={clearAll}
                  className="ml-auto text-xs px-2 py-0.5 bg-primary-light text-primary rounded-full border border-primary-border hover:bg-primary-lighter cursor-pointer flex flex-none"
                  aria-label="Clear all filters"
                >
                  Clear All
                </button>
              )}
              <div className="lg:hidden block">
                <div
                  className="flex items-center gap-2 text-gray-500 cursor-pointer"
                  onClick={() => setIsFilterDrawer(true)}
                >
                  <Icon name="tune" />
                  <p className="text-lg hidden sm:block">Filters</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:hidden block mt-2">
            <FilterChips
              minPrice={minPrice}
              maxPrice={maxPrice}
              DEFAULT_MIN={DEFAULT_MIN}
              DEFAULT_MAX={DEFAULT_MAX}
              sort={sort}
              brands={brands}
              categories={categories}
              clearPrice={clearPrice}
              clearSort={clearSort}
              clearBrand={clearBrand}
              clearCategory={clearCategory}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center">
              <WatchSkeleton />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-danger">{error}</p>
            </div>
          ) : watchData?.data?.data?.length ? (
            <>
              <div className="rongonaa-shop-grid mt-4">
                {watchData?.data?.data
                  .filter(
                    (watch: WatchData) =>
                      watch?.inventory?.stock_status !== "out-of-stock"
                  )
                  .map((watch: WatchData) => (
                    <WatchCard key={watch._id} data={watch} />
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

      <FilterDrawer
        isFilterDrawer={isFilterDrawer}
        setIsFilterDrawer={setIsFilterDrawer}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        sort={sort}
        setSort={setSort}
        brands={brands}
        setBrands={setBrands}
        categories={categories}
        setCategories={setCategories}
        filterCategories={"all"}
        priceClear={priceClear ?? false}
      />
    </div>
  );
}

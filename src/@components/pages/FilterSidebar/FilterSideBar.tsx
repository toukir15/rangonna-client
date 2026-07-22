"use client";
import TermsCheckbox from "@/@components/core/Checkbox/TermsCehckbox";
import { useRef, useEffect, useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FilterSideBarProps,
  ISideBarItems,
} from "@/@interfaces/common.interface";
import { brandData, categoryData, sortData } from "@/utils/data";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ToastService } from "@/utils/toaster.service";

export default function FilterSideBar({
  setMinPrice,
  setMaxPrice,
  sort,
  setSort,
  brands,
  setBrands,
  categories,
  setCategories,
  filterCategories = "",
  priceClear,
  filterBrand,
}: FilterSideBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBrandRoute = pathname?.startsWith("/brand");

  // 🔹 API থেকে আসা default range
  const [defaultMin, setDefaultMin] = useState<number | null>(null);
  const [defaultMax, setDefaultMax] = useState<number | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [tempMin, setTempMin] = useState<number | null>(null);
  const [tempMax, setTempMax] = useState<number | null>(null);
  const activeThumbRef = useRef<"min" | "max" | null>(null);

  // 🔹 current URL params
  const currentParams = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => (obj[k] = v));
    return obj;
  }, [searchParams]);

  const pushParams = (
    patch: Record<string, string | string[] | number | undefined | null>
  ) => {
    const params = new URLSearchParams(currentParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  };

  useEffect(() => {
    if (!filterCategories) return;

    const fetchPriceRangeData = async () => {
      try {
        const res = await ProductService.getPriceRange({
          category: filterCategories,
        });
        if (res.data) {
          const minVal = res.data.min_price ?? 0;
          const maxVal = res.data.max_price ?? 10000;
          setDefaultMin(minVal);
          setDefaultMax(maxVal);
          setTempMin(minVal);
          setTempMax(maxVal);
        }
      } catch (err: any) {
        ToastService.error(err?.message || "Failed to load price range");
      }
    };
    fetchPriceRangeData();
  }, [priceClear, filterCategories]);
  useEffect(() => {
    if (!filterBrand) return;

    const fetchPriceRangeData = async () => {
      try {
        const res = await ProductService.getPriceRange({
          brand: filterBrand,
        });
        if (res.data) {
          const minVal = res.data.min_price ?? 0;
          const maxVal = res.data.max_price ?? 10000;
          setDefaultMin(minVal);
          setDefaultMax(maxVal);
          setTempMin(minVal);
          setTempMax(maxVal);
        }
      } catch (err: any) {
        ToastService.error(err?.message || "Failed to load price range");
      }
    };
    fetchPriceRangeData();
  }, [priceClear, filterBrand]);
  // 🔹 slider math
  const range =
    defaultMin !== null && defaultMax !== null ? defaultMax - defaultMin : 0;

  const clampToSlider = (clientX: number) => {
    if (!sliderRef.current || defaultMin === null || defaultMax === null)
      return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const pos = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(defaultMin + pos * range);
  };

  const minPosition =
    defaultMin !== null && tempMin !== null
      ? ((tempMin - defaultMin) / range) * 100
      : 0;
  const maxPosition =
    defaultMax !== null && tempMax !== null
      ? ((tempMax - defaultMin!) / range) * 100
      : 100;

  const startDrag = (thumb: "min" | "max") => {
    activeThumbRef.current = thumb;
  };

  const commitPrice = () => {
    if (tempMin !== null && tempMax !== null) {
      setMinPrice?.(tempMin);
      setMaxPrice?.(tempMax);
      pushParams({ minPrice: tempMin, maxPrice: tempMax });
    }
  };

  const endDrag = () => {
    if (activeThumbRef.current) commitPrice();
    activeThumbRef.current = null;
  };

  const onPointerMove = (clientX: number) => {
    if (!activeThumbRef.current || defaultMin === null || defaultMax === null)
      return;
    const newValue = clampToSlider(clientX);
    if (activeThumbRef.current === "min") {
      setTempMin(Math.min(newValue, (tempMax ?? defaultMax) - 1));
    } else {
      setTempMax(Math.max(newValue, (tempMin ?? defaultMin) + 1));
    }
  };

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (defaultMin === null || defaultMax === null) return;
    const clickValue = clampToSlider(e.clientX);

    const distMin = Math.abs(clickValue - (tempMin ?? defaultMin));
    const distMax = Math.abs(clickValue - (tempMax ?? defaultMax));

    if (distMin <= distMax) {
      setTempMin(Math.min(clickValue, (tempMax ?? defaultMax) - 1));
    } else {
      setTempMax(Math.max(clickValue, (tempMin ?? defaultMin) + 1));
    }
    setTimeout(commitPrice, 0);
  };

  // 🔹 mouse events
  useEffect(() => {
    const mouseMove = (e: MouseEvent) => onPointerMove(e.clientX);
    const mouseUp = () => endDrag();
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
    document.addEventListener("mouseleave", mouseUp);
    return () => {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("mouseleave", mouseUp);
    };
  }, [tempMin, tempMax]);

  // 🔹 touch events
  useEffect(() => {
    const touchMove = (e: TouchEvent) => {
      if (activeThumbRef.current) e.preventDefault();
      const t = e.touches[0];
      if (t) onPointerMove(t.clientX);
    };
    const touchEnd = () => endDrag();
    document.addEventListener("touchmove", touchMove, { passive: false });
    document.addEventListener("touchend", touchEnd, { passive: true });
    document.addEventListener("touchcancel", touchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchmove", touchMove as any);
      document.removeEventListener("touchend", touchEnd as any);
      document.removeEventListener("touchcancel", touchEnd as any);
    };
  }, [tempMin, tempMax]);

  // 🔹 Checkbox change
  const handleCheckboxChange = (
    type: "brand" | "category" | "sort",
    value: string,
    checked: boolean
  ) => {
    if (type === "brand") {
      if (!setBrands) return;
      const next = checked ? [value] : [];
      setBrands(next);
      pushParams({ brand: next });
      return;
    }
    if (type === "sort") {
      if (!setSort) return;
      const next = checked ? [value] : [];
      setSort(next);
      pushParams({ sort: next[0] ?? null });
      return;
    }
    if (!setCategories) return;
    const list = categories ?? [];
    const next = checked ? [...list, value] : list.filter((i) => i !== value);
    setCategories(next);
    pushParams({ category: next });
  };

  const isBrandChecked = (name: string) => (brands ?? []).includes(name);
  const isSortChecked = (name: string) => (sort ?? []).includes(name);

  // hidden categories
  const hiddenCategories = [
    "Leather Strap",
    "Stainless Steel",
    "Silicone Strap",
  ];
  const hiddenCategories1 = ["men", "women", "couple", "smart-watches", "kids"];

  const filteredCategories = categoryData.filter((item) => {
    if (
      pathname?.startsWith("/watches/leather-strap") ||
      pathname?.startsWith("/watches/stainless-steel") ||
      pathname?.startsWith("/watches/silicone-strap")
    ) {
      return !hiddenCategories.includes(item.name);
    } else if (
      pathname?.startsWith("/watches/men") ||
      pathname?.startsWith("/watches/women") ||
      pathname?.startsWith("/watches/couple") ||
      pathname?.startsWith("/watches/smart-watches") ||
      pathname?.startsWith("/watches/kids")
    ) {
      return !hiddenCategories1.includes(item.name);
    }
    return true;
  });

  return (
    <div className="select-none">
      {/* 🔹 Price Filter */}
      <div className="bg-white pe-4 pl-3 py-3 rounded-md border border-primary-border">
        <h3 className="font-bold text-base text-gray-600">Filter by price</h3>

        {defaultMin === null || defaultMax === null ? (
          <p className="mt-4 text-sm text-gray-400">Loading price range…</p>
        ) : (
          <>
            <div
              className="mt-4 relative h-8"
              ref={sliderRef}
              onClick={onTrackClick}
            >
              <div className="absolute top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full w-full" />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-primary rounded-full pointer-events-none"
                style={{
                  left: `${minPosition}%`,
                  width: `${Math.max(0, maxPosition - minPosition)}%`,
                }}
              />
              <div
                className="absolute border-s-4 h-4 w-2 border-primary -translate-y-1/2 top-1/2 cursor-pointer z-10 shadow-md"
                style={{ left: `${minPosition}%` }}
                onMouseDown={() => startDrag("min")}
                onMouseUp={commitPrice}
              />
              <div
                className="absolute border-s-4 h-4 w-2 border-primary -translate-y-1/2 top-1/2 cursor-pointer z-10 shadow-md"
                style={{ left: `${maxPosition}%` }}
                onMouseDown={() => startDrag("max")}
                onMouseUp={commitPrice}
              />
            </div>
            <p className="mt-2 text-sm">
              {tempMin !== null && tempMax !== null
                ? `৳${tempMin} — ৳${tempMax}`
                : "Loading..."}
            </p>
          </>
        )}
      </div>

      <div className="border-b border-primary-border my-2" />

      {/* 🔹 Sort Filter */}
      <div className="bg-white p-4 rounded-md border border-primary-border">
        <h3 className="font-bold text-base text-gray-600">Sort</h3>
        {sortData.map((item: ISideBarItems, index) => (
          <TermsCheckbox
            key={`sort-${index}`}
            name={`sort:${item.name}`}
            label={item.label}
            rightLabel={item.rightLabel}
            checked={isSortChecked(item.name)}
            onChange={(_ignored, checked) =>
              handleCheckboxChange("sort", item.name, checked)
            }
            className="mt-2"
            labelClassName="flex justify-between w-full"
          />
        ))}
      </div>

      <div className="border-b border-primary-border my-2" />

      {/* 🔹 Category Filter */}
      <div className="bg-white p-4 rounded-md border border-primary-border">
        <h3 className="font-bold text-base text-gray-600">
          Filter by categories
        </h3>
        {filteredCategories.map((item: ISideBarItems, index) => (
          <TermsCheckbox
            key={`category-${index}`}
            name={`category:${item.name}`}
            label={item.label}
            rightLabel={item.rightLabel}
            checked={(categories ?? []).includes(item.name)}
            onChange={(_ignored, checked) =>
              handleCheckboxChange("category", item.name, checked)
            }
            className="mt-2"
            labelClassName="flex justify-between w-full"
          />
        ))}
      </div>

      {/* 🔹 Brand Filter */}
      {!isBrandRoute && (
        <>
          <div className="border-b border-primary-border my-2" />
          <div className="bg-white p-4 rounded-md border border-primary-border">
            <h3 className="font-bold text-base text-gray-600">
              Filter by Brand
            </h3>
            {brandData.map((item: ISideBarItems, index) => (
              <TermsCheckbox
                key={`brand-${index}`}
                name={`brand:${item.name}`}
                label={item.label}
                rightLabel={item.rightLabel}
                checked={isBrandChecked(item.name)}
                onChange={(_ignored, checked) =>
                  handleCheckboxChange("brand", item.name, checked)
                }
                className="mt-2"
                labelClassName="flex justify-between w-full"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

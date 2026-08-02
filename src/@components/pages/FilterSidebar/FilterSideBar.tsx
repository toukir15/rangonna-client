"use client";
import TermsCheckbox from "@/@components/core/Checkbox/TermsCehckbox";
import { useRef, useEffect, useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FilterSideBarProps,
  ISideBarItems,
} from "@/@interfaces/common.interface";
import { categoryData, sortData } from "@/utils/data";
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
    <aside className="rongonaa-filter select-none">
      {/* Price */}
      <section className="rongonaa-filter__panel">
        <h3 className="rongonaa-filter__title">Filter by price</h3>

        {defaultMin === null || defaultMax === null ? (
          <p className="rongonaa-filter__hint">Loading price range…</p>
        ) : (
          <>
            <div
              className="rongonaa-filter__slider"
              ref={sliderRef}
              onClick={onTrackClick}
            >
              <div className="rongonaa-filter__slider-track" />
              <div
                className="rongonaa-filter__slider-range"
                style={{
                  left: `${minPosition}%`,
                  width: `${Math.max(0, maxPosition - minPosition)}%`,
                }}
              />
              <button
                type="button"
                aria-label="Minimum price"
                className="rongonaa-filter__slider-thumb"
                style={{ left: `${minPosition}%` }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startDrag("min");
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  startDrag("min");
                }}
                onMouseUp={commitPrice}
              />
              <button
                type="button"
                aria-label="Maximum price"
                className="rongonaa-filter__slider-thumb"
                style={{ left: `${maxPosition}%` }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startDrag("max");
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  startDrag("max");
                }}
                onMouseUp={commitPrice}
              />
            </div>

            <div className="rongonaa-filter__price-row">
              <span className="rongonaa-filter__price-chip">
                ৳{tempMin?.toLocaleString("en-BD")}
              </span>
              <span className="rongonaa-filter__price-sep" aria-hidden>
                —
              </span>
              <span className="rongonaa-filter__price-chip">
                ৳{tempMax?.toLocaleString("en-BD")}
              </span>
            </div>
          </>
        )}
      </section>

      {/* Sort */}
      <section className="rongonaa-filter__panel">
        <h3 className="rongonaa-filter__title">Sort</h3>
        <div className="rongonaa-filter__list">
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
              className="rongonaa-filter__check"
              labelClassName="rongonaa-filter__check-label"
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="rongonaa-filter__panel">
        <h3 className="rongonaa-filter__title">Filter by categories</h3>
        <div className="rongonaa-filter__list">
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
              className="rongonaa-filter__check"
              labelClassName="rongonaa-filter__check-label"
            />
          ))}
        </div>
      </section>
    </aside>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Icon from "@/@components/core/Icon/Icon";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ToastService } from "@/utils/toaster.service";

interface MobileSearchProps {
  embedded?: boolean;
}

const MobileSearch = ({ embedded = false }: MobileSearchProps) => {
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchId.trim().length < 3) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res: any = await ProductService.getSearchGlobal({
          searchTerm: searchId,
        });

        if (res?.success) {
          setFilteredSuggestions(res.data || []);
          setShowSuggestions((res.data || []).length > 0);
        } else {
          ToastService.error(res?.message);
        }
      } catch (err: any) {
        ToastService.error(err.message);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchId]);

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);
    router.push(`/product/${encodeURIComponent(suggestion?.slug)}`);
  };

  const handleSubmit = () => {
    if (!searchId.trim()) return;
    router.push(`/churi?search=${encodeURIComponent(searchId)}`);
    setShowSuggestions(false);
  };

  return (
    <div className={embedded ? "w-full" : "lg:hidden w-full px-4 pb-3 pt-1"}>
      <div className="rongonaa-search-shell rongonaa-search-shell--mobile">
        <div className="rongonaa-search-shell__bar">
          <Icon
            name="search"
            variant="outlined"
            size={20}
            className="rongonaa-search-icon"
          />
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            type="search"
            enterKeyHint="search"
            placeholder="Search bangles..."
            className="rongonaa-search-input"
          />
          <button
            type="button"
            className="rongonaa-search-submit"
            onClick={handleSubmit}
            aria-label="Search"
          >
            <Icon name="arrow_forward" size={18} className="rongonaa-search-submit__arrow" />
          </button>
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionBoxRef}
            className="absolute top-[calc(100%+0.45rem)] left-0 right-0 z-50"
          >
            <div className="rongonaa-suggestions-panel max-h-64 overflow-y-auto p-2">
              <ul>
                {filteredSuggestions.map((suggestion: any, index: number) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="rongonaa-suggestion-item">
                      <Image
                        src={
                          suggestion?.featured_image?.src || "/placeholder.png"
                        }
                        alt={
                          suggestion?.featured_image?.title ||
                          suggestion?.title ||
                          "Product"
                        }
                        height={44}
                        width={52}
                        className="rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-secondary">
                          {suggestion?.title}
                        </p>
                        <p className="mt-1 text-sm font-bold text-primary">
                          ৳{suggestion?.pricing?.sale_price}
                          <del className="ml-2 font-medium text-secondary/35">
                            ৳{suggestion?.pricing?.regular_price}
                          </del>
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearch;

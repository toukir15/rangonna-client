"use client";
import React from "react";
import Icon from "@/@components/core/Icon/Icon";

interface FilterChipsProps {
  minPrice: number;
  maxPrice: number;
  DEFAULT_MIN: number;
  DEFAULT_MAX: number;
  sort: string[];
  brands: string[];
  categories: string[];
  clearPrice: () => void;
  clearSort: () => void;
  clearBrand: () => void;
  clearCategory: (c: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  minPrice,
  maxPrice,
  DEFAULT_MIN,
  DEFAULT_MAX,
  sort,
  brands,
  categories,
  clearPrice,
  clearSort,
  clearBrand,
  clearCategory,
}) => {
  const hasAnyFilterActive =
    minPrice !== DEFAULT_MIN ||
    maxPrice !== DEFAULT_MAX ||
    sort.length > 0 ||
    brands.length > 0 ||
    categories.length > 0;

  if (!hasAnyFilterActive) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(minPrice !== DEFAULT_MIN || maxPrice !== DEFAULT_MAX) && (
        <button
          onClick={clearPrice}
          className="text-xs px-2 py-0.5 bg-gray-100 rounded-full border border-gray-400 hover:bg-gray-200 cursor-pointer"
          aria-label="Clear price filter"
        >
          ৳{minPrice}–৳{maxPrice} ✕
        </button>
      )}

      {sort[0] && (
        <button
          onClick={clearSort}
          className="text-xs px-2 py-0.5 bg-gray-100 rounded-full border border-gray-400 hover:bg-gray-200 flex items-center gap-1 cursor-pointer"
          aria-label="Clear sort"
        >
          {sort[0]} <Icon name={"close"} size={14} />
        </button>
      )}

      {brands[0] && (
        <button
          onClick={clearBrand}
          className="text-xs px-2 py-0.5 bg-gray-100 rounded-full border border-gray-400 hover:bg-gray-200 flex items-center gap-1 cursor-pointer"
          aria-label="Clear brand"
        >
          {brands[0]} <Icon name={"close"} size={14} />
        </button>
      )}

      {categories.map((c) => (
        <button
          key={`chip-${c}`}
          onClick={() => clearCategory(c)}
          className="text-xs px-2 py-0.5 bg-gray-100 rounded-full border border-gray-400 hover:bg-gray-200 flex items-center gap-1 cursor-pointer"
          aria-label={`Clear category ${c}`}
        >
          {c} <Icon name={"close"} size={14} />
        </button>
      ))}
    </div>
  );
};

export default FilterChips;

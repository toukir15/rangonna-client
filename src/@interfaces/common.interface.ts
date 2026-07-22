export interface FilterSideBarProps {
  minPrice?: number;
  maxPrice?: number;
  setMinPrice?: (val: number) => void;
  setMaxPrice?: (val: number) => void;
  sort?: string[];
  setSort?: (val: string[]) => void;
  brands?: string[];
  setBrands?: (val: string[]) => void;
  categories?: string[];
  setCategories?: (val: string[]) => void;
  filterCategories?: string;
  filterBrand?: string;
  clearPrice?: any;
  priceClear?: boolean;
}

export interface ISideBarItems {
  name: string;
  label: string;
  rightLabel: string;
}

export interface Review {
  id: number;
  name: string;
  comment: string;
  date: string;
}

export interface ReviewCarouselProps {
  reviews: Review[];
  intervalMs?: number;
}

export interface IProduct {
  _id: string;
  brand: string | null;
  categories: string[];
  createdAt: string;
  featured_image: {
    src: string;
  };
  inventory: {
    stock_quantity: number;
    stock_status: "in-stock" | "out-of-stock";
    sold_quantity: number;
  };
  pricing: {
    sale_price: number;
    regular_price: number;
  };
  sku: string;
  slug: string;
  title: string;
  total_sales: number;
}

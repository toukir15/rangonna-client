export interface ApiResponse {
  success: boolean;
  data: {
    data: WatchData[];
    meta?: { total_record?: number; total_records?: number };
  };
}

export interface WatchData {
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

export interface FeaturedImage {
  src: string;
}

export interface Inventory {
  stock_quantity: number;
  stock_status: string;
  sold_quantity: number;
}

export interface Pricing {
  sale_price: number;
  regular_price: number;
}

export interface Meta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

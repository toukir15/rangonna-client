export interface Pricing {
  sale_price: number;
  regular_price: number;
  purchase_price: number;
}
export interface WholesalePricing {
  wholesale_price: number;
  wholesale_vip_price: number;
  resale_price: number;
}

export interface FeaturedImage {
  src: string;
  title: string;
  alt: string;
}

export interface ProductPrice {
  _id: string;
  title: string;
  pricing: Pricing;
  wholesale_pricing: WholesalePricing;
  featured_image: FeaturedImage;
}

export interface PaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface ProductPriceListData {
  data: ProductPrice[];
  meta: PaginationMeta;
}

export interface ProductPriceListResponse {
  success: boolean;
  message: string;
  data: ProductPriceListData;
}

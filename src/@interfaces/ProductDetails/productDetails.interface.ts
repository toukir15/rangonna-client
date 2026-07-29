export interface ProductAttribute {
  title?: string;
  value?: string;
}

export interface ProductVariantInventory {
  stock_quantity?: number;
  reserved_quantity?: number;
  sold_quantity?: number;
  stock_status?: "in_stock" | "out_of_stock" | "pre_order" | string;
}

export interface ProductVariant {
  sku: string;
  size: string;
  inventory: ProductVariantInventory;
}

export interface ProductImage {
  src: string;
  title?: string;
  alt?: string;
  text?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug?: string;
  sku?: string;
  status?: string;
  brand?: string;
  description?: string;
  short_description?: string;
  pricing: {
    sale_price: number;
    regular_price: number;
    purchase_price?: number;
  };
  /** @deprecated use variants[].inventory */
  inventory?: {
    stock_quantity?: number;
    stock_status?: "in-stock" | "out-of-stock" | string;
    sold_quantity?: number;
  };
  variants?: ProductVariant[];
  images?: ProductImage[];
  featured_image?: ProductImage;
  videos?: ProductImage[];
  attributes?: ProductAttribute[];
  categories?: string[] | string;
  tags?: string[];
  offer_text?: string;
  featured_product?: boolean;
  warranty?: any;
  product_id?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  total_sales?: number;
}

export interface ProductPageClientProps {
  initialSingleWatch: Product;
  initialMoreWatchData: any[];
}

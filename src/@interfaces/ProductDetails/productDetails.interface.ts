export interface ProductAttribute {
  title?: string;
  value?: string;
}

export interface Product {
  warranty: any;
  _id: string;
  title: string;
  pricing: {
    sale_price: number;
    regular_price: number;
  };
  inventory: {
    stock_quantity?: number;
    stock_status: "in-stock" | "out-of-stock" | string;
  };
  images: Array<{ src: string; title?: string; text?: string }>;
  description: string;
  short_description?: string;
  attributes?: ProductAttribute[];
  product_id?: string;
  sku?: string;
  featured_image?: { src: string };
  categories?: string[] | string;
  brand?: string;
  offer_text?: string;
}

export interface ProductPageClientProps {
  initialSingleWatch: Product;
  initialMoreWatchData: any[];
}

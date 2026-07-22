export interface ProductReportResponse {
  success: boolean;
  message: string;
  data: {
    data: ProductReport[];
    meta: MetaData;
  };
}

export interface MetaData {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface ProductReport {
  _id: string;
  product: Product;
  sku: string;
  purchased_quantity: number;
  purchased_amount: number;
  sold_quantity: number;
  sold_amount: number;
  profit: number;
  stock_quantity: number;
  stock_worth: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  sysid: string;
  categories: string[];
  images: ProductImage[];
  product_id: string;
  title: string;
}

export interface ProductImage {
  src: string;
  title: string;
  alt: string;
}

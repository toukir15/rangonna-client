export interface IWebsite {
  url: string;
  isEnabled: boolean;
}
export interface IProduct {
  product_id: number;
  name: string;
  price: number;
  image: string;
}
export interface IProductCategory {
  id: string;
  name: string;
  slug: string;
  _id: string;
}
export interface IProductData {
  _id: string;
  sku: string;
  categories: IProductCategory[];
  createdAt: string;
  updatedAt: string;
  description: string;
  domain: string;
  images: string[];
  name: string;
  price: string;
  product_id: string;
  short_description: string;
  status: string;
  stock_quantity: string;
  stock_status: string;
  total_sales: string;
}

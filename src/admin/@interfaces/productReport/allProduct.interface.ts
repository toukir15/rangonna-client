/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
export interface IProductsContext {
  productData: IProduct[];
  tableLoading: boolean;
  handleImageClick: (imageSrc: string) => void;
  togglePopup: (index: number) => void;
  popupIndex: number | null;
  popupRef: React.RefObject<HTMLDivElement | null>;
  handleDelete: any;
  setSortOrder: any;
  sortOrder: any;
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
}
export interface IProductPricing {
  sale_price: number;
  regular_price: number;
  purchase_price: number;
}

export interface IWholesalePricing {
  wholesale_price: number;
  wholesale_vip_price: number;
  resale_price: number;
}

export interface IInventory {
  stock_quantity: number;
  low_stock_notify: number;
  stock_status: string;
  sold_quantity: number;
}

export interface IProductImage {
  src: string;
  title: string;
  alt: string;
}

export interface IProductAttribute {
  title: string;
  value: string;
}

export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  categories: string[];
  brand: string;
  pricing: IProductPricing;
  wholesale_pricing: IWholesalePricing;
  inventory: IInventory;
  min_sold_quantity: number;
  max_sold_quantity: number;
  warranty: string;
  description: string;
  short_description: string;
  images: IProductImage[];
  featured_image: IProductImage;
  sku: string;
  status: string;
  tags: string[];
  attributes: IProductAttribute[];
  barcode: string;
  createdAt: string;
  updatedAt: string;
  is_seo: boolean;
}

export interface IProductMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IProductsData {
  data: IProduct[];
  meta: IProductMeta;
}

export interface IProductsResponse {
  success: boolean;
  message: string;
  data: IProductsData;
}

// src/@interfaces/products/category.interface.ts

export interface IProductCategory {
  _id: string;
  key: string;
  value: string;
}

export interface ICategoryMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number | string; // API কখনো string দিচ্ছে, তাই দুটোই রাখলাম
}

export interface ICategoryData {
  data: IProductCategory[];
  meta: ICategoryMeta;
}

export interface ICategoryResponse {
  success: boolean;
  message: string;
  data: IProductCategory[];
}

export interface IProductBrand {
  _id: string;
  key: string;
  value: string;
}

export interface IBrandMeta {
  total_record: number;
  total_page: number;
  page: number | string;
  limit: number | string;
}

export interface IBrandData {
  data: IProductBrand[];
  meta: IBrandMeta;
}

export interface IBrandResponse {
  success: boolean;
  message: string;
  data: IProductBrand[];
}

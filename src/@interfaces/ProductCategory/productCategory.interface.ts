export interface IProductCategoryImage {
  src: string;
  alt?: string;
  title?: string;
}

export interface IStoreProductCategory {
  _id?: string;
  key: string;
  value: string;
  image?: IProductCategoryImage | null;
}

export interface IStoreProductCategoryListResponse {
  success: boolean;
  message?: string;
  data?: {
    data?: IStoreProductCategory[];
    meta?: {
      total_record?: number;
      total_page?: number;
      page?: number | string;
      limit?: number | string;
    };
  };
}

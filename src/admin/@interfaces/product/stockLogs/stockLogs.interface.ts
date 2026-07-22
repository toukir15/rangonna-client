export interface IStockFlowResponse {
  success: boolean;
  message: string;
  data: {
    data: IStockFlowItem[];
    meta: IPaginationMeta;
  };
}

export interface IStockFlowItem {
  _id: string;

  product: {
    _id: string;
    featured_image: IFeaturedImage;
    title: string;
  };
  product_title: string;

  action:
    | "order_created"
    | "order_cancelled"
    | "order_returned"
    | "stock_adjusted"
    | "purchase_created"
    | string;
  direction: "in" | "out";
  stock_location: "product" | "warehouse" | string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFeaturedImage {
  src: string;
  title: string;
  alt: string;
}

export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

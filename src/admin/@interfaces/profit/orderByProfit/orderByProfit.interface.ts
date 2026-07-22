export interface IProfitByOrderResponse {
  success: boolean;
  message: string;
  data: {
    data: IProfitByOrder[];
    meta: IMeta;
  };
}

export interface IProfitByOrder {
  _id: string;
  order: {
    _id: string;
    discount_total: number;
    shipping_line: {
      total: number;
    };
  };
  order_sysid: string;
  profit: number;
  createdAt: string;
  updatedAt: string;
}

export interface IMeta {
  total_record: number;
  total_page: number;
  page: string;
  limit: string;
}

export interface IProfitByOrderSummaryResponse {
  success: boolean;
  message: string;
  data: {
    meta: IMeta;
    data: IProfitByOrderSummary[];
  };
}

export interface IProfitByOrderSummary {
  totalProfit: number;
  totalDiscount: number;
  shippingTotal: number;
  totalProductQuantity: number;
  totalOrder: number;
  date: string;
  netProfit: number;
}

export interface IMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

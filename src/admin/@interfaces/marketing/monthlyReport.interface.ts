export interface IMonthlyMarketingReportResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total_record: number;
      total_page: number;
      page: number;
      limit: number;
    };
    data: IMonthlyMarketingReport[];
  };
}

export interface IMonthlyMarketingReport {
  total_order: number;
  delivered: number;
  cancelled: number;
  returned: number;
  refunded: number;
  active_order: number;
  date: string;
  total_marketing_bdt: number;
  total_marketing_usd: number;
  delivery_total: number;
}

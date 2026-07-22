export interface IDailyReportResponse {
  success: boolean;
  message: string;
  data: {
    meta: IMeta;
    data: IDailyReport[];
  };
}

export interface IDailyReport {
  totalOrder: number;
  delivered: number;
  cancelled: number;
  returned: number;
  refunded: number;
  date: string;
  readyForBox: number;
}

export interface IMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

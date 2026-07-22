// User info inside _id
export interface IWholesaleUserInfo {
  user_id: string;
  user_name: string;
  user_phone: string;
}

// Each report row
export interface IWholesaleUserReport {
  _id: IWholesaleUserInfo;
  total_order: number;
  total_amount: number;
  delivery_amount: number;
  total_paid: number;
  total_due: number;
  active_amount: number;
  return_amount: number;
  cancel_amount: number;
  discount_total: number;
}

// Pagination meta
export interface IWholesaleUserReportMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

// Main API response
export interface IWholesaleUserReportResponse {
  success: boolean;
  message: string;
  data: {
    meta: IWholesaleUserReportMeta;
    data: IWholesaleUserReport[];
  };
}

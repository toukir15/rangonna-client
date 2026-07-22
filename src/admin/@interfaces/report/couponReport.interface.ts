// Single coupon report item
export interface ICouponReportItem {
  coupon_code: string;
  usage_count: number;
  total_amount: number;
}

// Pagination meta
export interface ICouponReportMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

// Main API response
export interface ICouponReportResponse {
  success: boolean;
  message: string;
  data: ICouponReportItem[];
  meta: ICouponReportMeta;
}

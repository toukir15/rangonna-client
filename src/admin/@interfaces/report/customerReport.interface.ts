// ===== Meta info =====
export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

// ===== Monthly customer report item =====
export interface IMonthlyCustomerReport {
  unique_new_customers: number;
  active_customers: number;
  first_created: string; // ISO date string
  last_created: string; // ISO date string
  year: number;
  month: number; // 1–12
  date: string; // Month start date (ISO)
  total_customers: string; // Month start date (ISO)
  repeated_customers: string; // Month start date (ISO)
}

// ===== API data wrapper =====
export interface IMonthlyCustomerReportData {
  meta: IPaginationMeta;
  data: IMonthlyCustomerReport[];
}

// ===== Full API response =====
export interface IMonthlyCustomerReportResponse {
  success: boolean;
  message: string;
  data: IMonthlyCustomerReportData;
}

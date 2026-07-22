// Single salary report item
export interface SalaryReportItem {
  user_name: string;
  total_salary: number;
  total_paid: number;
  total_due: number;
}

// Meta information
export interface SalaryReportMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

// Inner data object
export interface SalaryReportData {
  data: SalaryReportItem[];
  meta: SalaryReportMeta;
}

// Full API response
export interface SalaryReportResponse {
  success: boolean;
  message: string;
  data: SalaryReportData;
}

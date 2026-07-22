import { IBaseResponse } from "../common.interface";

export interface IBrandSalesReportItem {
  product_brand: string | null;
  total_order: number;
  delivery: number;
  canceled: number;
  return: number;
  refunded: number;
  in_transit: number;
}

export interface IBrandSalesReportMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IBrandSalesReportData {
  meta: IBrandSalesReportMeta;
  data: IBrandSalesReportItem[];
}

export type IBrandSalesReportResponse = IBaseResponse<IBrandSalesReportData>;

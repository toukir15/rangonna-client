import { IBaseResponse } from "../common.interface";

export interface ISingleProductReportData {
  date: string;
  total_order: number;
  delivery: number;
  canceled: number;
  return: number;
  refunded: number;
  in_transit: number;
}

export interface ISingleProductReportMeta {
  total_record: number;
  total_pages: number;
}

export interface ISingleProductReportItem {
  product_title: string;
  product_id: string;
  report_meta: ISingleProductReportMeta;
  report_data: ISingleProductReportData[];
}

export interface ISingleProductReportOuterMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface ISingleProductReportDataWrapper {
  meta: ISingleProductReportOuterMeta;
  data: ISingleProductReportItem[];
}

export type IProductSalesResponse =
  IBaseResponse<ISingleProductReportDataWrapper>;

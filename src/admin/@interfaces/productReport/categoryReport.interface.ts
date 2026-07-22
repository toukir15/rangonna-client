import { IBaseResponse } from "../common.interface";

export interface ICategorySalesReportItem {
  product_category: string | null;
  total_order: number;
  delivery: number;
  canceled: number;
  return: number;
  refunded: number;
  in_transit: number;
}

export interface ICategorySalesReportMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface ICategorySalesReportData {
  meta: ICategorySalesReportMeta;
  data: ICategorySalesReportItem[];
}

export type ICategorySalesReportResponse =
  IBaseResponse<ICategorySalesReportData>;

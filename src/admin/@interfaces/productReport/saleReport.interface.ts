import { IBaseResponse } from "../common.interface";

export interface IProductOrderReport {
  product_title: string;
  total_order: number;
  delivery: number;
  canceled: number;
  return: number;
  refunded: number;
  in_transit: number;
  product_id: string;
}

export interface IProductSalesMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IProductSalesData {
  meta: IProductSalesMeta;
  data: IProductOrderReport[];
}

export type IProductSalesResponse = IBaseResponse<IProductSalesData>;

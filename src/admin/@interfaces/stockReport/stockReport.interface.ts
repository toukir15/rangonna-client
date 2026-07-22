import { IBaseResponse } from "../common.interface";

export interface IBrandReport {
  total_purchased_quantity: number;
  total_purchase_amount: number;
  total_sales_amount: number;
  brand: string;
}

export interface ICategoryReport {
  total_purchased_quantity: number;
  total_purchase_amount: number;
  total_sales_amount: number;
  category: string;
}

export interface IWarehouseReport {
  total_purchased_quantity: number;
  total_purchase_amount: number;
  total_sales_amount: number;
}

export type IWarehouseReportResponse = IBaseResponse<IWarehouseReport>;

export interface IBrandReportResponse {
  total_purchased_quantity: number;
  total_purchase_amount: number;
  total_sales_amount: number;
  brand: string;
}

export interface IBrandReportResponse {
  success: boolean;
  message: string;
  data: IBrandReportResponse[];
}

export interface ICategoryReportReportItem {
  total_purchased_quantity: number;
  total_purchase_amount: number;
  total_sales_amount: number;
  category: string;
}

export interface ICategoryReportReportResponse {
  success: boolean;
  message: string;
  data: ICategoryReportReportItem[];
}

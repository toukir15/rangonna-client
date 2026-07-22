import { IBaseResponse } from "./../common.interface";
export type ISupplierReportResponse = IBaseResponse<ISupplierReport[]>;

export interface ISupplierReport {
  _id: string;
  total_purchase: number;
  total_amount: number;
  total_paid: number;
  total_due: number;
  company_name: string;
}

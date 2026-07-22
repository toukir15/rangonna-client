import { IBaseResponse } from "../common.interface";

export interface IExpenseReport {
  _id: string;
  total_amount: number;
  category_name: string;
}

export type IExpenseReportResponse = IBaseResponse<IExpenseReport[]>;

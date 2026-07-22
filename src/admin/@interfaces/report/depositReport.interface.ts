import { IBaseResponse } from "./../common.interface";
export type IDepositReportResponse = IBaseResponse<IDepositReport[]>;

export interface IDepositReport {
  _id: string;
  total_amount: number;
  company_name: string;
}

import { IBaseResponse } from "../common.interface";

export interface IOrderHistoryReportItem {
  totalOrder: number;
  delivered: number;
  cancelled: number;
  returned: number;
  refunded: number;
  date: string;
  createdAt?: string
}

export interface IOrderHistoryReportMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IUserReportData {
  meta: IOrderHistoryReportMeta;
  data: IOrderHistoryReportItem[];
}

export type IOrderHistoryReportResponse = IBaseResponse<IUserReportData>;

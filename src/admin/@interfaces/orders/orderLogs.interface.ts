export interface IOrderLog {
  _id: string;
  user_id: string;
  user_name: string;
  log_message: string;
  order_sysid: string;
  order: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderLogMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IOrderLogData {
  data: IOrderLog[];
  meta: IOrderLogMeta;
}

export interface IOrderLogResponse {
  success: boolean;
  message: string;
  data: IOrderLogData;
}

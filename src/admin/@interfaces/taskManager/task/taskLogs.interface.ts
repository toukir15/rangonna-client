// Single task log item
export interface ITaskLog {
  _id: string;
  user_name: string;
  log_message: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Pagination meta
export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

// Task logs response data wrapper
export interface ITaskLogData {
  data: ITaskLog[];
  meta: IPaginationMeta;
}

// Full API response
export interface ITaskLogResponse {
  success: boolean;
  message: string;
  data: ITaskLogData;
}

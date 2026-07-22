/* Single Advance Item */

export interface IEmployeeMini {
  _id: string;
  name: string;
}
export interface IAdvance {
  _id: string;
  employee: IEmployeeMini; // Employee ObjectId
  month: string; // e.g. "2025-12"
  amount: number;
  note?: string;
  createdAt?: any;
  updatedAt?: any;
}

/* Pagination Meta */
export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: string; // comes as string from API
  limit: string; // comes as string from API
}

/* Advances Data Wrapper */
export interface IAdvanceListData {
  data: IAdvance[];
  meta: IPaginationMeta;
}

/* Full API Response */
export interface IAdvanceListResponse {
  success: boolean;
  message: string;
  data: IAdvanceListData;
}

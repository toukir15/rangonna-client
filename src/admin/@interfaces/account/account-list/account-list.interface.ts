/* eslint-disable no-unused-vars */
import { Dispatch, SetStateAction } from "react";

export interface IAccount {
  _id: string;
  account_no: string;
  account_name: string;
  balance: number;
  initial_balance: number;
  notes: string;
  is_active: boolean;
  is_default: boolean;
  type: "cash" | "bank" | string;
  createdAt: string;
  updatedAt: string;
}
export interface AccountListContextType {
  accountListData: IAccount[];
  tableLoading: boolean;
  activeToggleLoading: Record<string, boolean>;
  defaultToggleLoading: Record<string, boolean>;
  toggleIsActive: (item: IAccount) => void;
  toggleIsADefault: (item: IAccount) => void;
  handleRemove: (id: string) => void;
  handleEditClick: () => void;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  modalMode: "Add" | "Edit";
  items: IAccount | null;
  getAccountList: () => void;
  setItems: Dispatch<SetStateAction<IAccount | null>>;
}

export interface IMeta {
  total_record: number;
  total_page: number;
  page: string;
  limit: string;
}

export interface IAccountData {
  data: IAccount[];
  meta: IMeta;
}

export interface IAccount {
  _id: string;
  account_no: string;
  account_name: string;
  balance: number;
  initial_balance: number;
  notes: string;
  is_active: boolean;
  is_default: boolean;
  type: "cash" | "bank" | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IAccountUpdateResponse {
  success: boolean;
  message: string;
  data: IAccount;
}

interface IBaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
export type IAccountResponse = IBaseResponse<IAccountData>;

export interface IApiErrorResponse {
  success: false;
  message: string;
}

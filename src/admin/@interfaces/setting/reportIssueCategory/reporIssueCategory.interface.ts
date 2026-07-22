/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { IBaseResponse } from "@admin/@interfaces/common.interface";
export interface IReportIssueCategory {
  _id: string;
  issue_title: string;
  issue_sub_title: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IReportIssueCategoryContextType {
  reportIssueData: IReportIssueCategory[];
  tableLoading: boolean;
  handleEditClick: (data: IReportIssueCategory) => void;
  handleRemove: (id: string) => void;
  modalMode: "Add" | "Edit";
  items: IReportIssueCategory | null;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getReportCategory: () => void;
  isModalOpen: boolean;
}

export interface IReportIssueCategoryMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IReportIssueCategoryData {
  data: IReportIssueCategory[];
  meta: IReportIssueCategoryMeta;
}

export type IReportIssueCategoryResponse =
  IBaseResponse<IReportIssueCategoryData>;

import { IBaseResponse } from "../common.interface";

export interface IReportIssuesResponse {
  success: boolean;
  message: string;
  data: IReportIssuesData;
}

export interface IReportIssuesData {
  meta: IMeta;
  data: IReportIssue[];
}

export interface IMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IReportIssue {
  _id: string;
  order_sysid: string;
  order: IOrder;
  description: string;
  issue_title: string;
  issue_sub_title: string;
  report_issue_line_items: IReportIssueLineItem[];
  status: "pending" | "resolved" | "closed" | string;
  createdAt: string;
  updatedAt: string;
  last_note?: ILastNote;
}

export interface IOrder {
  _id: string;
  customer: ICustomer;
  status: string;
  domain: string;
}

export interface ICustomer {
  phone: string;
}

export interface IReportIssueLineItem {
  title: string;
  image: string;
}

export interface ILastNote {
  user: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReportIssueCategoriesResponse {
  success: boolean;
  message: string;
  data: IReportIssueCategoriesData;
}

export interface IReportIssueCategoriesData {
  data: IReportIssueCategory[];
  meta: IMeta;
}

export interface IReportIssueCategory {
  _id: string;
  issue_title: string;
  issue_sub_title: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IOption {
  value: string;
  label: string;
}

export interface IDeleteReportIssueResponse {
  success: boolean;
  message: string;
}

export interface ICity {
  city_id: number | null;
  city_name: string;
}

export interface IZone {
  zone_id: number | null;
  zone_name: string;
}

export interface ICustomer {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: ICity;
  zone: IZone;
}

export interface IReportIssueOrder {
  _id: string;
  customer: ICustomer;
}

export interface IReportIssueLineItem {
  title: string;
  image: string;
}

export interface IReportIssueLog {
  user: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  name: string;
}
export interface IReportIssueDetails {
  image: string;
  _id: string;
  order_sysid: string;
  order: IReportIssueOrder;
  description: string;
  user: IUser;
  issue_title: string;
  issue_sub_title: string;
  report_issue_line_items: IReportIssueLineItem[];
  status: string;
  notes: string[];
  logs: IReportIssueLog[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  order_status: string;
  consignment_id: string | null;
}
export interface IReportIssueLogUser {
  _id: string;
  name: string;
}

export interface IReportIssueLogEntry {
  user: IReportIssueLogUser;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReportIssueLogsData {
  logs: IReportIssueLogEntry[];
}

export interface IReportIssueNoteUser {
  _id: string;
  name: string;
}

export interface IReportIssueNoteEntry {
  user: IReportIssueNoteUser;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReportIssueNotesData {
  notes: IReportIssueNoteEntry[];
}

export type IReportIssueNotesResponse = IBaseResponse<IReportIssueNotesData>;

export type IReportIssueLogsResponse = IBaseResponse<IReportIssueLogsData>;

export type IReportIssueResponse = IBaseResponse<IReportIssueDetails>;

/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import { Dispatch, SetStateAction } from "react";

export interface IWholeSaleUserContext {
  pathaoList: PathaoBooking[];
  tableLoading: boolean;
  isCheck: boolean;
  selectedOrders: string[];
  handleSelectAll: () => void;
  handleSelectOrder: (orderId: string) => void;
  handleImageClick: (imageSrc: string) => void;
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  totalPathaoOrders: number;
  setOrderId: Dispatch<SetStateAction<string | undefined>>;
  fetchPathaoList: () => Promise<void> | void;
  handleStatus: (id: string, status: string) => void;
}

export interface ICourierPathaoContext {
  pathaoList: PathaoBooking[];
  tableLoading: boolean;
  isCheck: boolean;
  handleSelectAll: () => void;
  selectedOrders: string[];
  handleSelectOrder: (orderId: string) => void;
  handleImageClick: (imageSrc: string) => void;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalOpen: boolean;
  totalPathaoOrders: number;
  setOrderId: React.Dispatch<React.SetStateAction<string | undefined>>;
  fetchPathaoList: () => Promise<void> | void;
}

export interface IPathaoBookingOrder {
  _id: string;
  total: number;
  due: number;
  status: string;
  payment: {
    title: string;
    transaction_id: string;
    payment_status: string;
  };
  domain: string;
}

export interface IWebhookLog {
  event: string;
  log_message: string;
  reason: string;
  timeStamp: string;
}

export interface PathaoBooking {
  _id: string;
  order_sysid: string;
  order: IPathaoBookingOrder;
  consignment_id: string | null;
  reason: string;
  is_error: boolean;
  error_message: string;
  booking_error: string;
  delivery_status: string;
  payment_status: string;
  delivery_fee: number | null;
  cod: number | null;
  collected_amount: number | null;
  invoice_id: string;
  order_created: string;
  date_updated: string;
  webhook_logs: IWebhookLog[];
  createdAt: string;
  updatedAt: string;
}

export interface PathaoBookingsMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface PathaoBookingsData {
  find(arg0: (item: { status: string; count: number }) => boolean): unknown;
  data: PathaoBooking[];
  meta: PathaoBookingsMeta;
}

export interface PathaoBookingsResponse {
  success: boolean;
  message: string;
  data: PathaoBookingsData;
}

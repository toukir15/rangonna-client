export interface Website {
  url: string;
  isEnabled: boolean;
}

export interface Customer {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalOrders: number;
  totalValue: number;
}

export type CustomerGroup = "general" | "vip" | "wholesale" | string;

export interface ICustomer {
  _id: string;
  phone: string;
  customer_group: CustomerGroup;
  first_name: string;
  last_name: string;
  is_active: boolean;
  total_orders: number;
  total_delivery_orders: number;
}

export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface ICustomerListData {
  data: ICustomer[];
  meta: IPaginationMeta;
}

export interface ICustomerListResponse {
  success: boolean;
  message: string;
  data: ICustomerListData;
}

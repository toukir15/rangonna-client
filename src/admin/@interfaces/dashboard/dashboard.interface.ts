export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  wooCommerce: number;
}

export interface Website {
  isEnabled: unknown;
  id: number;
  name: string;
}

export interface Order {
  id: number;
  customerName: string;
  mobileNumber: string;
  status: string;
  totalPrice: string;
  fraudCheck: number | null;
}

export interface SalesData {
  day: string;
  dailySales: number;
  totalQuantity: number;
}

export interface ProductData {
  name: string;
  quantity: number;
}

export interface IEstimateData {
  label: string;
  icon: string;
  value: string;
  color?: string;
  percentage?: string;
  status?: string;
}

export interface IDashboardChart {
  salesData: SalesData[];
  productData: ProductData[];
}

export interface SalesData {
  day: string;
  dailySales: number;
  totalQuantity: number;
}

export interface IShopCartProps {
  color?: string;
  icon: string;
  label: string;
  value: string;
  percentage: string;
}

export interface IOrderSkipTwentySummaryItem {
  month: string;
  total_order: number;
  total_amount: number;
}

export interface IOrderSkipTwentySummaryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrderSkipTwentySummaryResponse {
  success: boolean;
  message: string;
  data: {
    data: IOrderSkipTwentySummaryItem[];
    meta: IOrderSkipTwentySummaryMeta;
  };
}

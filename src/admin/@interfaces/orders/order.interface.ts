/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
export interface AllOrderListContextType {
  orderList: SingleOrder[];
  tableLoading: boolean;
  selectedOrders: string[];
  handleListPrintSelected: () => void;
  handleOrderPrintSelected: () => void;
  selectedAction: SelectOption;
  setSelectedAction: React.Dispatch<React.SetStateAction<SelectOption>>;
  handleOrderInvoicePrint: () => void;
  statusSubmitting: boolean;
  isCheck: boolean;
  handleSelectAll: () => void;
  handleSelectOrder: (id: string) => void;
  handleImageClick: (imageSrc: string) => void;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filter: string;
}

export interface Label {
  id: string;
  labelName: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface Product {
  image: { src: string };
  name: string;
  total: number;
  quantity: number;
}

export interface Cities {
  city_id: number;
  city_name: string;
}

export interface Zones {
  zone_id: number;
  zone_name: string;
}

export interface Order {
  id: number;
  name: string;
  webURL: string;
  contactNumber: string;
  payment: string;
  timeRemaining: string;
  productsData: Product[];
  type: string;
  status: string;
  statusClass: string;
  address: string;
  total: number;
  due: number;
  sid: number;
  consignment_id?: string;
  notes: string[];
  labels: string[];
  fee: number;
  advance: number;
  discount: number;
}

export interface StatusCounts {
  [key: string]: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  wooCommerce: number;
}

export interface Website {
  id?: number;
  url: string;
  webhookStatus: boolean;
  isEnabled: boolean;
  webhookEnabled?: boolean;
}

export interface IfilterOrder {
  value: string;
  label: string;
}

export interface SingleOrder {
  _id: any;
  order_id: string;
  order_src: string;
  status: string;
  total: number;
  due: number;
  paid: number;
  discount_total: number;
  shipping_total: number;
  transaction_id: string;
  payment_method_title: string;
  courier_status: boolean;
  consignment_id: string;
  customer_ip_address: string;
  domain: string;
  note: any[];
  refunds: any[];
  coupon_lines: any[];
  line_items: Array<any>;
  meta_data: Array<any>;
  createdAt: string;
  updatedAt: string;
  order_createdAt: string;
  is_print: boolean;
  sysid?: any;

  billing: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };

  pathao_city: string;
  pathao_zone: string;
}

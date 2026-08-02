/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

export interface ICourierBookingContext {
  orderList: PathaoBooking[];
  tableLoading: boolean;
  isCheck: boolean;
  handleSelectAll: () => void;
  selectedOrders: string[];
  handleSelectOrder: (orderId: string) => void;
  handleImageClick: (imageSrc: string) => void;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalOpen: boolean;
  setModalOpenBooking: React.Dispatch<React.SetStateAction<boolean>>;
  setOrderId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export interface PathaoBookingsResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total_record: number;
      total_page: number;
      page: number;
      limit: number;
    };
    data: PathaoBooking[];
  };
}

export interface PathaoBooking {
  _id: string;
  order_sysid: string;
  consignment_id: string | null;
  error_message: string;
  createdAt: string;
  updatedAt: string;
  order: Order;
}

export interface Order {
  _id: string;
  status: string; // e.g. "ready-for-box"
  total: number;
  due: number;
  domain: string;
  customer: Customer;
  line_items: LineItem[];
  payment: Payment;
}

export interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: {
    city_id: number | null;
    city_name: string;
  };
  zone: {
    zone_id: number | null;
    zone_name: string;
  };
}

export interface LineItem {
  title: string;
  product_id: {
    _id: string;
    featured_image: {
      src: string;
    };
  };
  sku?: string;
  size?: string;
  quantity: number;
  subtotal: number;
  total: number;
  price: number;
}

export interface Payment {
  title: string; // "cash on delivery"
  transaction_id: string;
  payment_status: string; // "due"
}

export interface IPathaoBookingCountResponse {
  success: boolean;
  message: string;
  data: IPathaoBookingCount;
}
export interface IPathaoBookingCount {
  pending: number;
  complete: number;
  total: number;
}

export interface IBookingResponse {
  success: boolean;
  message: string;
}

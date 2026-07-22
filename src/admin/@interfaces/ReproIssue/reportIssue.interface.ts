export interface IOrder {
  _id: string;
  sysid: string;
  reason: string;
  total: number;
  paid: number;
  due: number;
  discount_total: number;
  customer: ICustomer;
  line_items: ILineItem[];
  shipping_line: IShippingLine;
  coupon: ICoupon;
  order_created: string;
  status: string;
  payment: IPayment;
  domain: string;
  is_print: boolean;
  is_verified: boolean;
  updatedAt: string;
  __v: number;
  courier_city: ICourier;
  courier_zone: ICourier;
  pathao_zone_name: string;
  customer_note: ICustomerNote;
}

export interface ICustomer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: {
    city_id: number;
    city_name: string;
  };
  zone: {
    zone_id: number;
    zone_name: string;
  };
}

export interface ILineItem {
  title: string;
  product_id: IProduct;
  quantity: number;
  subtotal: number;
  total: number;
  price: number;
}

export interface IProduct {
  _id: string;
  featured_image: {
    src: string;
  };
  inventory: {
    stock_quantity: number;
    low_stock_notify: number | null;
    stock_status: string;
    manage_stock: boolean;
    sold_quantity: number;
  };
}

export interface IShippingLine {
  title: string;
  total: number;
}

export interface ICoupon {
  code: string;
  amount: number;
}

export interface IPayment {
  title: string;
  transaction_id: string;
  payment_status: string;
}

export interface ICourier {
  key: string;
  value: string;
}

export interface ICustomerNote {
  user: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
}

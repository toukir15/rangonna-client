export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type GetIncompleteOrdersResponse = ApiResponse<IncompleteOrdersList>;

export interface IncompleteOrdersList {
  data: IncompleteOrder[];
  meta: ListMeta;
}

export interface IncompleteOrder {
  _id: string;
  total: number;
  customer: Customer;
  line_items: LineItem[];
  shipping_line: ShippingLine;
  customer_ip_address: string;
  domain: string;
  notes: OrderNote[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zone: string;
  postcode: string;
}

export interface LineItem {
  title: string;
  product_id?: ProductRef;
  quantity: number;
  subtotal: number;
  total: number;
  price: number;
  image?: string;
}

export interface ProductRef {
  _id: string;
  featured_image?: FeaturedImage;
}

export interface FeaturedImage {
  src: string;
}

export interface ShippingLine {
  title: string;
  total: number;
}

export interface OrderNote {
  user?: NoteUser;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteUser {
  _id: string;
  name: string;
}

export interface ListMeta {
  total_record: number;
  total_page: number;
  page: string;
  limit: string;
}

export type DeleteIncompleteOrderResponse = ApiResponse<IncompleteOrderDeleted>;

export interface IncompleteOrderDeleted {
  _id: string;
  total: number;
  customer: Customer;
  line_items: LineItem[];
  shipping_line: ShippingLine;
  customer_ip_address: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  notes: OrderNote[];
}

export interface ApiRow {
  total: string | number | null | undefined;
  delivered: string | number | null | undefined;
  [key: string]: unknown;
}

export interface PhoneStats {
  total: number;
  delivered: number;
}

export type PhoneResult = readonly [string, PhoneStats];

export type PhoneResults = PhoneResult[];

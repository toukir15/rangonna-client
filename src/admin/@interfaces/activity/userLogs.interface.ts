export interface IUserLogsResponse {
  success: boolean;
  message: string;
  data: {
    data: IUserLog[];
    meta: ILogsMeta;
  };
}

export interface IUserLog {
  _id: string;
  user: IUser;
  action: string;
  log_message: string;
  changes?: ILogChanges; // optional — not all logs have changes
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ILogChanges {
  products_count?: IBeforeAfter<number>;
  total_quantity?: IBeforeAfter<number>;
  affected_products?: { after: number };
  note?: { after: string };
  line_items?: IBeforeAfter<IOrderLineItem[]>;
  total?: IBeforeAfter<number>;
  due?: IBeforeAfter<number>;
}

export interface IBeforeAfter<T> {
  before?: T;
  after?: T;
}

export interface IOrderLineItem {
  title: string;
  product_id: string;
  quantity: number;
  subtotal: number;
  total: number;
  price: number;
}

export interface ILogsMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

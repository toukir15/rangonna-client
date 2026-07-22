/* ================================
   Purchase Return API Interfaces
   ================================ */

/* Root API Response */
export interface IPurchaseReturnResponse {
  success: boolean;
  message: string;
  data: IPurchaseReturnPayload;
}

/* Payload */
export interface IPurchaseReturnPayload {
  data: IPurchaseReturn[];
  meta: IPaginationMeta;
}

/* Purchase Return Item */
export interface IPurchaseReturn {
  _id: string;
  order_id: string;
  status: "return";
  old_order_id?: string | null;
  issue_title?: string;
  createdAt: string;
  updatedAt: string;
  order: IOrder | null;
  old_order: IOrder | null;
}

/* Order */
export interface IOrder {
  _id: string;
  sysid: string;
  status: string;
  line_items: IOrderLineItem[];
}

/* Order Line Item */
export interface IOrderLineItem {
  title: string;
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  total: number;
}

/* Pagination Meta */
export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

// delayDelivery.interface.ts

export interface IDelayDeliveryBooking {
  domain: string;
  _id: string;
  order_sysid: string;
  consignment_id: string;
  reason: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  customer_name: string;
  customer_phone: string;
  order_status: string;
  last_note: {
            text: string
          }
}

export interface IDelayDeliveryMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IDelayDeliveryData {
  data: IDelayDeliveryBooking[];
  meta: IDelayDeliveryMeta;
}

export interface IDelayDeliveryResponse {
  success: boolean;
  message: string;
  data: IDelayDeliveryData;
}

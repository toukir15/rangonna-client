export type CourierProvider = "pathao" | "steadfast";

export interface PathaoCredentials {
  client_id: string;
  client_secret: string;
  user_name: string;
  password: string;
  store_id: string;
  is_delivered: string;
}

export interface SteadfastCredentials {
  api_key: string;
  secret_key: string;
  merchant_store_id: string;
}

export interface CreatePathaoCourierPayload {
  name: string;
  provider: "pathao";
  website_id: string;
  store_name: string;
  webhook?: string;
  credentials: PathaoCredentials;
}

export interface CreateSteadfastCourierPayload {
  name: string;
  provider: "steadfast";
  website_id: string;
  store_name: string;
  webhook?: string;
  credentials: SteadfastCredentials;
}

export type CreateCourierPayload =
  | CreatePathaoCourierPayload
  | CreateSteadfastCourierPayload;

export interface Courier {
  id: number;
  name: string;
  courier_name?: string;
}

export interface Website {
  id: number;
  url: string;
  webhookStatus: boolean;
  isEnabled: boolean;
}

export interface Assignment {
  website_id: number;
  courier_id: number;
  courier_type: string;
}

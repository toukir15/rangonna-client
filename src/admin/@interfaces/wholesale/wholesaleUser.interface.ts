export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    data: WholesaleUser[];
    meta: Meta;
  };
}

export interface WholesaleUser {
  business: BusinessInfo;
  address: AddressInfo;
  wholesale_setting: WholesaleSetting;

  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  account_type: "wholesale" | "retailer" | string;
  tier: "vip" | "general" | string;
  documents: string[];
  payment_methods: any[]; // update later when structure known
  is_payment_verified: boolean;
  is_verified: boolean;
  active_status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessInfo {
  company_name: string;
  trade_license: string;
  business_type: "retailer" | "wholesale" | string;
}

export interface AddressInfo {
  division: string;
  district: string;
  area: string;
  full_address: string;
}

export interface WholesaleSetting {
  approved_by: string | null;
  credit_limit: number;
  outstanding: number;
  custom_mqq: number;
}

export interface Meta {
  total_record: number;
  total_page: number;
  page: number | string;
  limit: number | string;
}

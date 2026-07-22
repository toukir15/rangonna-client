export interface EmiTenure {
  months: number;
  label: string;
  feePercent: number;
}

export interface EmiBankWithRates {
  id: string;
  name: string;
  initials: string;
  tenures: EmiTenure[];
  isActive?: boolean;
}

export interface EmiBankApiRecord {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  initials?: string;
  is_active?: boolean;
  isActive?: boolean;
  tenures?: EmiTenureApiRecord[];
  emi_tenures?: EmiTenureApiRecord[];
  rates?: EmiTenureApiRecord[];
}

export interface EmiTenureApiRecord {
  months: number;
  label?: string;
  fee_percent?: number;
  feePercent?: number;
}

export interface EmiBanksApiResponse {
  success?: boolean;
  data?: EmiBankApiRecord[];
}

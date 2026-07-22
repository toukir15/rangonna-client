// Single campaign source report
export interface ICampaignReportSource {
  total_order: number;
  total_delivery: number;
  total_cancel: number;
  total_return: number;
  active_order: number;
  order_source: "facebook" | "google" | string;
}

// API response interface
export interface ICampaignReportSourceResponse {
  success: boolean;
  message: string;
  data: {
    data: ICampaignReportSource[];
  };
}

// Campaign summary counts
export interface ICampaignReportSummary {
  total_count: number;
  delivery_count: number;
  cancel_count: number;
  return_count: number;
}

// API response interface
export interface ICampaignReportSummaryResponse {
  success: boolean;
  message: string;
  data: {
    data: ICampaignReportSummary;
  };
}

export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IGoogleAdsCampaignReport {
  total_order: number;
  delivery_count: number;
  cancel_count: number;
  return_count: number;
  active_order: number;
  campaign_id: string;
}

export interface IGoogleAdsCampaignReportResponse {
  success: boolean;
  message: string;
  data: {
    meta: IPaginationMeta;
    data: IGoogleAdsCampaignReport[];
  };
}

export interface IFacebookUtmContentReport {
  utm_content_id: string;
  total_order: number;
  delivery_count: number;
  cancel_count: number;
  active_order: number;
  return_count: number;
}

export interface IFacebookUtmContentReportResponse {
  success: boolean;
  message: string;
  data: {
    meta: IPaginationMeta;
    data: IFacebookUtmContentReport[];
  };
}

export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface IFacebookUtmTermReport {
  utm_term_id: string;
  total_order: number;
  delivery_count: number;
  cancel_count: number;
  active_order: number;
  return_count: number;
}

export interface IFacebookUtmTermReportWithRate extends IFacebookUtmTermReport {
  delivery_rate: number;
  cancel_rate: number;
  return_rate: number;
}

export interface IFacebookUtmTermReportResponse {
  success: boolean;
  message: string;
  data: {
    meta: IPaginationMeta;
    data: IFacebookUtmTermReport[];
  };
}

// Single campaign report row
export interface IUtmCampaignReportItem {
  total_order: number;
  delivery_count: number;
  cancel_count: number;
  return_count: number;
  active_order: number;
  utm_campaign_id: string;
}

// Pagination meta
export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

// Main response data object
export interface IUtmCampaignReportData {
  meta: IPaginationMeta;
  data: IUtmCampaignReportItem[];
}

// API response wrapper
export interface IUtmCampaignReportResponse {
  success: boolean;
  message: string;
  data: {
    meta: IPaginationMeta;
    data: IUtmCampaignReportItem[];
  };
}

export interface ICityOrderReportItem {
  city_name: string;
  total_count: number;
  transit: number;
  delivery: number;
  return: number;
}

export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: number;
  limit: number;
}

export interface ICityOrderReportResponse {
  success: boolean;
  message: string;
  data: {
    meta: IPaginationMeta;
    data: ICityOrderReportItem[];
  };
}

export interface IWebsite {
  _id: string;
  web_name: string;
}

export interface MarketingWebhook {
  _id: string;
  website: IWebsite;
  website_url: string;
  webhook_url: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total_record: number;
  total_page: number;
  page: string;
  limit: string;
}

export interface MarketingWebhookResponse {
  success: boolean;
  message: string;
  data: {
    data: MarketingWebhook[];
    meta: PaginationMeta;
  };
}

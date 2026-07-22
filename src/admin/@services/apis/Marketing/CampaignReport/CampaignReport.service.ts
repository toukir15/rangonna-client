/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const CampaignReportService = {
  getCampaignReportCard: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report` + queryStringMapper(queryParams)
    );
  },
  getCampaignReportTable: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report/source` + queryStringMapper(queryParams)
    );
  },
  getCampaignReportGoogle: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report/google-ads-campaign-id` + queryStringMapper(queryParams)
    );
  },
  getCampaignReportFbAds: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report/facebook-utm-content` + queryStringMapper(queryParams)
    );
  },
  getCampaignReportFbAdset: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report/facebook-utm-term` + queryStringMapper(queryParams)
    );
  },
  getCampaignReportFb: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report/facebook-utm-campaign` + queryStringMapper(queryParams)
    );
  },
  getCampainSearch: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report/daily` + queryStringMapper(queryParams)
    );
  },
  getCampainSearchOrder: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report/daily/order` + queryStringMapper(queryParams)
    );
  },

  getCitiesReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/marketing-report/city` + queryStringMapper(queryParams)
    );
  },
  getCartList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/campaign-report/daily/summary` + queryStringMapper(queryParams)
    );
  },
};

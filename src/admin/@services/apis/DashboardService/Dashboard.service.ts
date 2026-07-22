/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const dashBoardService = {
  getStatus: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/dashboard/all` + queryStringMapper(queryParams));
  },
  getSummary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/order-status-summary` + queryStringMapper(queryParams)
    );
  },
  getNaviforce: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/naviforce` + queryStringMapper(queryParams)
    );
  },
  getTimeverse: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/timeverse` + queryStringMapper(queryParams)
    );
  },
  getBikreta: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/bikreta` + queryStringMapper(queryParams)
    );
  },
  getOlevs: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/olevs` + queryStringMapper(queryParams)
    );
  },
  getWholesale: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/wholesale` + queryStringMapper(queryParams)
    );
  },
  getOrderSkipTwentySummary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/order-skip-twenty-summary` + queryStringMapper(queryParams)
    );
  },
};

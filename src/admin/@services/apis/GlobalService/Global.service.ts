/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const GlobalService = {
  getPermission: async (): Promise<any> => {
    return await apiIns.get(`/auth/permission`);
  },

  getWebsiteList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/website/suggestions` + queryStringMapper(queryParams)
    );
  },
  getWebsiteData: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/website` + queryStringMapper(queryParams));
  },

  getSearchOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/global-search-order` + queryStringMapper(queryParams)
    );
  },

  createWebsite: async (payload: any): Promise<any> =>
    await apiIns.post("/website", payload),

  updateWebsite: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/website/" + accId, payload),

  updateWebsitePriority: async (payload: any): Promise<any> =>
    await apiIns.patch("/website/priority", payload),

  updateWebsiteToggle: async (supId: string, payload: any): Promise<any> =>
    await apiIns.patch("/website/active-status/" + supId, payload),

  deleteWebsite: async (accId: string): Promise<any> =>
    await apiIns.delete("/website/" + accId),
};

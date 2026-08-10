/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const GlobalService = {
  getPermission: async (): Promise<any> => {
    return await apiIns.get(`/auth/permission`);
  },

  getSearchOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/global-search-order` + queryStringMapper(queryParams)
    );
  },
};

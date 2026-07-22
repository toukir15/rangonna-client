/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const shopService = {
  getShop: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product/product-suggestion` + queryStringMapper(queryParams)
    );
  },
  createShop: async (payload: any): Promise<any> =>
    await apiIns.post("/setting/general-settings", payload),
  updateShop: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/setting/general-settings/" + orderId, payload),

  deleteGeneralSetting: async (accId: string): Promise<any> =>
    await apiIns.delete("/setting/general-settings/" + accId),
};

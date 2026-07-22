/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ReturnListService = {
  getReturnList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-return-list` + queryStringMapper(queryParams)
    );
  },

  createReturnList: async (payload: any): Promise<any> =>
    await apiIns.post("/order-return-list", payload),

  updateStatus: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/order-return-list/change-status/" + accId, payload),

  getSuggestionOrder: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/return-list-phone-suggestion` + queryStringMapper(queryParams)
    );
  },

  getCartList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-return-list/cart` + queryStringMapper(queryParams)
    );
  },
};

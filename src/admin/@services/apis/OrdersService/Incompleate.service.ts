/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const IncompleteOrdersService = {
  getIncompleteOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/incomplete-order` + queryStringMapper(queryParams)
    );
  },

  createIncompompleateNote: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/incomplete-order/note/" + orderId, payload),

  IncompleteOrderDelete: async (oId: string): Promise<any> =>
    await apiIns.delete("/incomplete-order/" + oId),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const RefundListService = {
  getRefundList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/order-refund` + queryStringMapper(queryParams));
  },
  getSingleRefund: async (oId: any): Promise<any> =>
    await apiIns.get("/order-refund/" + oId),

  createRefundList: async (payload: any): Promise<any> =>
    await apiIns.post("/order-refund", payload),

  createNote: async (accId: any, payload: any): Promise<any> =>
    await apiIns.post("/order-refund/notes/" + accId, payload),

  updateRefund: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/order-refund/" + accId, payload),

  updateStatusRefund: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/order-refund/status/" + accId, payload),

  deleteRefund: async (accId: string): Promise<any> =>
    await apiIns.delete("/order-refund/" + accId),
};

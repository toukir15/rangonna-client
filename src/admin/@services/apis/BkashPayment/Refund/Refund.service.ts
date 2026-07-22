/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const RefundService = {
  getRefund: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/bkash/refund` + queryStringMapper(queryParams));
  },

  createRefund: async (payload: any): Promise<any> =>
    await apiIns.post("/bkash/refund", payload),

  updateRefund: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/bkash/refund/" + accId, payload),

  deleteRefund: async (accId: string): Promise<any> =>
    await apiIns.delete("/bkash/refund/" + accId),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const DepositService = {
  getDeposit: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/deposit` + queryStringMapper(queryParams));
  },

  createCourierPayment: async (payload: any): Promise<any> =>
    await apiIns.post("/courier-payment", payload),
  createDeposit: async (payload: any): Promise<any> =>
    await apiIns.post("/deposit", payload),

  createIdDeposit: async (payload: any): Promise<any> =>
    await apiIns.post("/deposit", payload),

  updateDeposit: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/deposit/" + trsId, payload),

  deleteDeposit: async (trsId: string): Promise<any> =>
    await apiIns.delete("/deposit/" + trsId),
};

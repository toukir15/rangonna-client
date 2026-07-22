/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const HolidaySalaryService = {
  getHolidaySalary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/salary-holiday` + queryStringMapper(queryParams));
  },
  createHolidaySalary: async (payload: any): Promise<any> =>
    await apiIns.post("/salary-holiday", payload),

  deleteHolidaySalary: async (accId: string): Promise<any> =>
    await apiIns.delete("/salary-holiday/" + accId),

  // ---------------------------------------------------

  getAdvanceOrderId: async (pId?: any): Promise<any> => {
    return await apiIns.get(`/order-payment/` + pId);
  },

  createAdvanceOrder: async (payload: any): Promise<any> =>
    await apiIns.post("/order-payment", payload),

  updateAdvanceOrder: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/order-payment/" + trsId, payload),
};

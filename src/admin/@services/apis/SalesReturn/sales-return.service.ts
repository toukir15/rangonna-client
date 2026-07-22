/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const SalesService = {
  getAllSales: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/sales-return` + queryStringMapper(queryParams));
  },

  createSales: async (payload: any): Promise<any> =>
    await apiIns.post("/sales-return", payload),

  updateSales: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/sales-return/" + trsId, payload),

  deleteSales: async (trsId: string): Promise<any> =>
    await apiIns.delete("/sales-return/" + trsId),
};

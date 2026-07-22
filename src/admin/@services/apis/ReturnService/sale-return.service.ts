/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
// import { queryStringMapper } from "@admin/utils";

export const SaleReturnService = {
  // getSaleReturn: async (queryParams?: any): Promise<any> => {
  //   return await apiIns.get(`/sales-return` + queryStringMapper(queryParams));
  // },

  // createSaleReturn: async (payload: any): Promise<any> =>
  //   await apiIns.post("/sales-return", payload),

  // updateSaleReturn: async (cId: string, payload: any): Promise<any> =>
  //   await apiIns.patch("/sales-return/" + cId, payload),

  // deleteSaleReturn: async (cId: string): Promise<any> =>
  //   await apiIns.delete("/sales-return/" + cId),

  getSaleOrderWithId: async (cId: any): Promise<any> =>
    await apiIns.get("/order/return/" + cId),
};

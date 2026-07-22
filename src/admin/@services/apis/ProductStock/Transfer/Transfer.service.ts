/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const StockTransferService = {
  getStockTransfer: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/stock-transfer` + queryStringMapper(queryParams));
  },

  createStockTransfer: async (payload: any): Promise<any> =>
    await apiIns.post("/stock-transfer", payload),

  getSingleStockTransfer: async (pId: any): Promise<any> =>
    await apiIns.get("/stock-transfer/" + pId),

  updateStockTransfer: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/stock-transfer/" + pId, payload),
};

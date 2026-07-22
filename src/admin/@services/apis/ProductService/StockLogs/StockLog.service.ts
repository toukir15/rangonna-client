/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const StockLogsService = {
  getStockLogs: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/stock-flow-logs` + queryStringMapper(queryParams)
    );
  },
  getLogsWithId: async (pId?: any): Promise<any> => {
    return await apiIns.get(`/stock-flow-logs/product/` + pId);
  },
};

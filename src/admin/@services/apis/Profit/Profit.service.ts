/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ProfitService = {
  getDailyProfit: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/profit/daily` + queryStringMapper(queryParams));
  },
  getMonthlyProfit: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/profit/monthly` + queryStringMapper(queryParams));
  },
  getOrderByProfit: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/profit/profit-by-order` + queryStringMapper(queryParams)
    );
  },

  deleteProfitByOrder: async (Id: string): Promise<any> =>
    await apiIns.delete("/delivery-list/" + Id),
};

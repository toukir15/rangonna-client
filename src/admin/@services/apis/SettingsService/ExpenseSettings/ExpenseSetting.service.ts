/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ExpenseSettingService = {
  getExpenseSetting: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/expense-settings` + queryStringMapper(queryParams)
    );
  },

  createExpenseSetting: async (payload: any): Promise<any> =>
    await apiIns.post("/expense-settings", payload),

  updateExpenseSetting: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/expense-settings/" + accId, payload),

  deleteExpenseSetting: async (accId: string): Promise<any> =>
    await apiIns.delete("/expense-settings/" + accId),
};

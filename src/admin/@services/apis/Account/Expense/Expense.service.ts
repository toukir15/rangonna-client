/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ExpenseService = {
  getExpense: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/expense` + queryStringMapper(queryParams));
  },

  createExpense: async (payload: any): Promise<any> =>
    await apiIns.post("/expense", payload),

  updateExpense: async (exId: string, payload: any): Promise<any> =>
    await apiIns.patch("/expense/" + exId, payload),

  deleteExpense: async (exId: string): Promise<any> =>
    await apiIns.delete("/expense/" + exId),
};

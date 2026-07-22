/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ExpensesService = {
  getExpenses: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/expense-category` + queryStringMapper(queryParams),
    );
  },

  createExpenses: async (payload: any): Promise<any> =>
    await apiIns.post("/expense-category", payload),

  updateExpenses: async (expensesId: any, payload: any): Promise<any> =>
    await apiIns.patch("/expense-category/" + expensesId, payload),

  updateExpensesPriority: async (payload: any): Promise<any> =>
    await apiIns.patch("/expense-category/priority", payload),

  updateExpenseToggle: async (supId: string, payload: any): Promise<any> =>
    await apiIns.patch("/expense-category/active-status/" + supId, payload),

  deleteExpenses: async (expensesId: string): Promise<any> =>
    await apiIns.delete("/expense-category/" + expensesId),

  getExpensesSuggestions: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/expense-category/suggestions` + queryStringMapper(queryParams),
    );
  },
};

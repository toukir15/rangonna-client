/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const DepositCategoryService = {
  getDepositCategory: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/deposit-category` + queryStringMapper(queryParams)
    );
  },

  createDepositCategory: async (payload: any): Promise<any> =>
    await apiIns.post("/deposit-category", payload),

  updateDepositCategory: async (
    expensesId: string,
    payload: any
  ): Promise<any> =>
    await apiIns.patch("/deposit-category/" + expensesId, payload),

  updateDepositCategoryPriority: async (payload: any): Promise<any> =>
    await apiIns.patch("/deposit-category/priority", payload),

  updateDepositToggle: async (supId: string, payload: any): Promise<any> =>
    await apiIns.patch("/deposit-category/active-status/" + supId, payload),

  deleteDepositCategory: async (expensesId: string): Promise<any> =>
    await apiIns.delete("/deposit-category/" + expensesId),
};

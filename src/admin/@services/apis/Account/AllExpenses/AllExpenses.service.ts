/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const AllExpensesService = {
  getAllExpenses: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/expense` + queryStringMapper(queryParams));
  },

  createAllExpenses: async (payload: any): Promise<any> =>
    await apiIns.post("/expense", payload),

  updateAllExpenses: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/expense/" + trsId, payload),

  deleteAllExpenses: async (trsId: string): Promise<any> =>
    await apiIns.delete("/expense/" + trsId),

  demoRoute: async (ids: any): Promise<any> =>
    await apiIns.post("/order/change-domain/" + ids),

  // getIds: async (): Promise<any> => {
  //   return await apiIns.get(`/order/all/id`);
  // },
};

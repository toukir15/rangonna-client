/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const MenuService = {
  getMenu: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/navbar-menu` + queryStringMapper(queryParams)
    );
  },

  createMenu: async (payload: any): Promise<any> =>
    await apiIns.post("/navbar-menu", payload),

  updateMenu: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/navbar-menu/" + accId, payload),

  getSingleMenu: async (accId: any): Promise<any> =>
    await apiIns.get("/navbar-menu/" + accId),

  deleteMenu: async (accId: string): Promise<any> =>
    await apiIns.delete("/navbar-menu/" + accId),
};

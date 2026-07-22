/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const DepositSettingService = {
  getDepositSetting: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/account-settings` + queryStringMapper(queryParams)
    );
  },

  createDepositSetting: async (payload: any): Promise<any> =>
    await apiIns.post("/account-settings", payload),

  updateDepositSetting: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/account-settings/" + accId, payload),

  deleteDepositSetting: async (accId: string): Promise<any> =>
    await apiIns.delete("/account-settings/" + accId),
};

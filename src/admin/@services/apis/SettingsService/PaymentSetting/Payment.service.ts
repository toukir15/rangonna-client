/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const PaymentSettingService = {
  getPaymentSetting: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/company-settings/deposit-settings` + queryStringMapper(queryParams)
    );
  },

  createPaymentSetting: async (payload: any): Promise<any> =>
    await apiIns.post("/company-settings/deposit-settings", payload),

  updatePaymentSetting: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/company-settings/deposit-settings/" + trsId, payload),

  deletePaymentSetting: async (trsId: string): Promise<any> =>
    await apiIns.delete("/company-settings/deposit-settings/" + trsId),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const SmsSettingService = {
  getSmsSetting: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/settings/mim-sms-settings` + queryStringMapper(queryParams),
    );
  },
  updateSmsSettings: async (payload: any): Promise<any> =>
    await apiIns.patch("/settings/mim-sms-settings", payload),
};

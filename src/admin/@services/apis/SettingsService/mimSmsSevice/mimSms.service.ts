/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const MimSmsService = {
  getMimSms: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/mim-sms` + queryStringMapper(queryParams));
  },
  getMimSmsSuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/mim-sms/suggestion` + queryStringMapper(queryParams),
    );
  },

  createMimSms: async (payload: any): Promise<any> =>
    await apiIns.post("/mim-sms", payload),

  sendMimSms: async (payload: any): Promise<any> =>
    await apiIns.post("/mim-sms/send", payload),

  updateMimSms: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/mim-sms/" + accId, payload),

  deleteMimSms: async (accId: string): Promise<any> =>
    await apiIns.delete("/mim-sms/" + accId),
};

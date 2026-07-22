/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const marketingWebhookService = {
  getMarketingWebhook: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/marketing-webhook` + queryStringMapper(queryParams)
    );
  },
  createMarketingWebhook: async (payload: any): Promise<any> =>
    await apiIns.post("/marketing-webhook", payload),

  updateMarketingWebhook: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/marketing-webhook/" + accId, payload),

  deleteMarketingWebhook: async (accId: string): Promise<any> =>
    await apiIns.delete("/marketing-webhook/" + accId),
};

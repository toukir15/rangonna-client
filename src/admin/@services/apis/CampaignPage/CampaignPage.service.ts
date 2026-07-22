/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const CampaignPageService = {
  getCampaignPages: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/campaign-page` + queryStringMapper(queryParams));
  },

  getCampaignPageById: async (pageId: string): Promise<any> =>
    await apiIns.get("/campaign-page/" + pageId),

  createCampaignPage: async (payload: any): Promise<any> =>
    await apiIns.post("/campaign-page", payload),

  updateCampaignPage: async (pageId: string, payload: any): Promise<any> =>
    await apiIns.patch("/campaign-page/" + pageId, payload),

  deleteCampaignPage: async (pageId: string): Promise<any> =>
    await apiIns.delete("/campaign-page/" + pageId),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const LandingService = {
  getLanding: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/landing-page` + queryStringMapper(queryParams));
  },
  getSingleLanding: async (eId?: any): Promise<any> => {
    return await apiIns.get(`/landing-page/` + eId);
  },

  createLanding: async (payload: any): Promise<any> =>
    await apiIns.post("/landing-page", payload),

  updateLanding: async (trsId: any, payload: any): Promise<any> =>
    await apiIns.patch("/landing-page/" + trsId, payload),

  deleteLanding: async (trsId: string): Promise<any> =>
    await apiIns.delete("/landing-page/" + trsId),
};

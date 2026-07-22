/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const DutyService = {
  getDuty: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/roster-plan` + queryStringMapper(queryParams));
  },

  createDuty: async (payload: any): Promise<any> =>
    await apiIns.post("/roster-plan", payload),

  updateDuty: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/roster-plan/" + trsId, payload),

  deleteDuty: async (trsId: string): Promise<any> =>
    await apiIns.delete("/roster-plan/" + trsId),
};

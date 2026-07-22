/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const LeavePolicyService = {
  getLeavePolicy: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/leave-policy` + queryStringMapper(queryParams));
  },
  createLeavePolicy: async (payload: any): Promise<any> =>
    await apiIns.post("/leave-policy", payload),

  updateLeavePolicy: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/leave-policy/" + accId, payload),

  deleteLeavePolicy: async (accId: string): Promise<any> =>
    await apiIns.delete("/leave-policy/" + accId),
};

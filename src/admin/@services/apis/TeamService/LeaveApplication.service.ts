/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const LeaveApplicationService = {
  getLeaveApplication: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/leave-application` + queryStringMapper(queryParams)
    );
  },

  getLeaveById: async (eId: any): Promise<any> =>
    await apiIns.get("/leave-application/" + eId),

  updateLeaveApplication: async (
    permissionId: any,
    payload: any
  ): Promise<any> =>
    await apiIns.patch("/leave-application/" + permissionId, payload),
};

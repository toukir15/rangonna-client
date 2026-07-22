/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const MyLeaveService = {
  getMyLeave: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/leave-application/my-application` + queryStringMapper(queryParams),
    );
  },
  getRosterPlan: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/roster-plan/my` + queryStringMapper(queryParams));
  },
  getRosterPlanSummary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/roster-plan/my/summary` + queryStringMapper(queryParams),
    );
  },
  getDuty: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/duty/my-duty` + queryStringMapper(queryParams));
  },
  getDutySummary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/duty/my-duty/summary` + queryStringMapper(queryParams),
    );
  },
  getHolidaySummary: async (year?: any): Promise<any> => {
    return await apiIns.get(`/holiday-notice/dashboard/year/` + year);
  },
  createMyLeave: async (payload: any): Promise<any> =>
    await apiIns.post("/leave-application", payload),

  getLeaveHistory: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/leave-application/my-application/summary` +
        queryStringMapper(queryParams),
    );
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const WeeklyHolidayService = {
  getWeeklyHoliday: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/weekly-holiday` + queryStringMapper(queryParams));
  },

  createWeeklyHoliday: async (payload: any): Promise<any> =>
    await apiIns.post("/weekly-holiday", payload),

  updateWeeklyHoliday: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/weekly-holiday/" + trsId, payload),

  deleteWeeklyHoliday: async (trsId: string): Promise<any> =>
    await apiIns.delete("/weekly-holiday/" + trsId),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const HolidayNoticeService = {
  getHolidayNotice: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/holiday-notice` + queryStringMapper(queryParams));
  },

  createHolidayNotice: async (payload: any): Promise<any> =>
    await apiIns.post("/holiday-notice", payload),

  createIdDeposit: async (payload: any): Promise<any> =>
    await apiIns.post("/holiday-notice", payload),

  updateHolidayNotice: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/holiday-notice/" + trsId, payload),

  deleteHolidayNotice: async (trsId: string): Promise<any> =>
    await apiIns.delete("/holiday-notice/" + trsId),
};

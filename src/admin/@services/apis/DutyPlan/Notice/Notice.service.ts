/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const NoticeService = {
  getNotice: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/notice` + queryStringMapper(queryParams));
  },

  createNotice: async (payload: any): Promise<any> =>
    await apiIns.post("/notice", payload),

  updateNotice: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/notice/" + trsId, payload),

  deleteNotice: async (trsId: string): Promise<any> =>
    await apiIns.delete("/notice/" + trsId),
};

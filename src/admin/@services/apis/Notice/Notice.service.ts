/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { IQueryParams, queryStringMapper } from "@admin/utils";

export const NoticeService = {
  getNotice: async (queryParams?: IQueryParams): Promise<any> => {
    return await apiIns.get(`/notice` + queryStringMapper(queryParams));
  },
  getMyNotices: async (queryParams?: IQueryParams): Promise<any> => {
    return await apiIns.get(
      `/notice/my-notices` + queryStringMapper(queryParams),
    );
  },
  getMyNoticesWithId: async (accId: any): Promise<any> =>
    await apiIns.get("/notice/" + accId),

  updateNoticesWithId: async (accId: any): Promise<any> =>
    await apiIns.patch("/notice/seen/" + accId),
};

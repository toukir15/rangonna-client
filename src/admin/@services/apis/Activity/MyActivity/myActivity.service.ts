/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const MyActivityService = {
  getActivity: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/user-log/user/` + queryStringMapper(queryParams));
  },
  getActivityWithId: async (pId?: any): Promise<any> => {
    return await apiIns.get(`/user-log/` + pId);
  },
};

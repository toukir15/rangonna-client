/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const userLogsService = {
  getUserLogs: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/user-log` + queryStringMapper(queryParams));
  },
  getLogsWithId: async (pId?: any): Promise<any> => {
    return await apiIns.get(`/user-log/` + pId);
  },
};

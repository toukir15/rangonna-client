/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const OrderActivityService = {
  getActivityLogs: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/order-logs` + queryStringMapper(queryParams));
  },
};

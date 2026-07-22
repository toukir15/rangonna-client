/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const MyWarehouseService = {
  getMyWarehouseReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/stock-transfer-report` +
        queryStringMapper(queryParams)
    );
  },
  getMyWarehouseReportCart: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/stock-transfer-report/summary` +
        queryStringMapper(queryParams)
    );
  },

};

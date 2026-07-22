/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const sockReportService = {
  getWarehouseReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/warehouse-report` + queryStringMapper(queryParams)
    );
  },
  getBrandReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/warehouse-report/brand-report` + queryStringMapper(queryParams)
    );
  },
  getCategory: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/warehouse-report/category-report` + queryStringMapper(queryParams)
    );
  },
};

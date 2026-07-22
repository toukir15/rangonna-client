/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ReportService = {
  fetchWarehouseBrandReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-stock-report/by-brand` + queryStringMapper(queryParams),
    );
  },
  fetchWarehouseCategoryReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-stock-report/by-category` + queryStringMapper(queryParams),
    );
  },
};

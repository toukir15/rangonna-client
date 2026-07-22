/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const productReportService = {
  getSalesReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-report/sales-report` + queryStringMapper(queryParams)
    );
  },
  getSingleReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-report/daily/sales-report` + queryStringMapper(queryParams)
    );
  },
  getBrandReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-report/brand/sales-report` + queryStringMapper(queryParams)
    );
  },
  getCategoryReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-report/category/sales-report` + queryStringMapper(queryParams)
    );
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const MethodSummaryService = {

  getMethodSummary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/account-report/monthly/summary` +
        queryStringMapper(queryParams)
    );
  },
  getMethodSummaryReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/account-report/payment-method` +
        queryStringMapper(queryParams)
    );
  },
  
};

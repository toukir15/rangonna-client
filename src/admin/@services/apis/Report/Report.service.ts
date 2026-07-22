/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const reportService = {
  getSupplierReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/supplier-report` + queryStringMapper(queryParams)
    );
  },
  getDepositReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/deposit-report` + queryStringMapper(queryParams));
  },
  getExpenseReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/expense-report` + queryStringMapper(queryParams));
  },

  getCouponReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/coupon-report` + queryStringMapper(queryParams));
  },
  getCustomerReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/customer-report/monthly` + queryStringMapper(queryParams)
    );
  },
};

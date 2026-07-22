/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const OrderReportProfitService = {
  getDailyProfit: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-report/daily` + queryStringMapper(queryParams)
    );
  },
  getSalaryCard: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/salary/report-card` + queryStringMapper(queryParams)
    );
  },

  createMontyProfit: async (payload: any): Promise<any> =>
    await apiIns.post("/current-value/monthly", payload),

  getMonthlyProfit: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-report/monthly` + queryStringMapper(queryParams)
    );
  },
  sourceReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-report/source` + queryStringMapper(queryParams)
    );
  },

  deleteProfitByOrder: async (Id: string): Promise<any> =>
    await apiIns.delete("/delivery-list/" + Id),

  userReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/user-report/admin/daily` + queryStringMapper(queryParams)
    );
  },
  userMonthlyReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/user-report/admin/delivery-date` + queryStringMapper(queryParams)
    );
  },
  getCancelReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-report/cancel-report` + queryStringMapper(queryParams)
    );
  },
  getCancelByOrder: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-report/cancel-report-per-order` + queryStringMapper(queryParams)
    );
  },
  getCancelCardReportPerOrder: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-report/cancel-report-per-order/data-count` +
        queryStringMapper(queryParams)
    );
  },
  getPaymentReportSummary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/account-report/monthly/summary` +
        queryStringMapper(queryParams)
    );
  },
  getPaymentReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/account-report/monthly` +
        queryStringMapper(queryParams)
    );
  },
  getReturnByOrder: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-report/return-report-per-order` + queryStringMapper(queryParams)
    );
  },
  getReturnCardReportPerOrder: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order-report/return-report-per-order/data-count` +
        queryStringMapper(queryParams)
    );
  },

  salaryReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/salary-report` + queryStringMapper(queryParams));
  },
};

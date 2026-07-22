/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const SalaryReportService = {
  getSalaryReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/salary` + queryStringMapper(queryParams));
  },
  createSalaryReport: async (payload: any): Promise<any> =>
    await apiIns.post("/salary", payload),

  updateSalaryReport: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/salary/" + accId, payload),

  deleteSalaryReport: async (accId: string): Promise<any> =>
    await apiIns.delete("/salary/" + accId),

  updateSalaryStatus: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/salary/status/" + accId, payload),
  updateOrderLevel: async (accId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/change-line-item-status/" + accId, payload),

  getSalaryReports: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/salary-report` + queryStringMapper(queryParams));
  },
};

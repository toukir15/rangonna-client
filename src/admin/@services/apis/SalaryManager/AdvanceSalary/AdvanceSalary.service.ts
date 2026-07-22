/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const AdvanceSalaryService = {
  getAdvanceSalary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/salary-advance` + queryStringMapper(queryParams));
  },
  createAdvanceSalary: async (payload: any): Promise<any> =>
    await apiIns.post("/salary-advance", payload),

  deleteAdvanceSalary: async (accId: string): Promise<any> =>
    await apiIns.delete("/salary-advance/" + accId),

  // ---------------------------------------------------

  getAdvanceOrderId: async (pId?: any): Promise<any> => {
    return await apiIns.get(`/order-payment/` + pId);
  },

  createAdvanceOrder: async (payload: any): Promise<any> =>
    await apiIns.post("/order-payment", payload),

  updateAdvanceOrder: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/order-payment/" + trsId, payload),

// ---------------------------------------------------

  getAdvanceOrderReportIssueId: async (pId?: any): Promise<any> => {
    return await apiIns.get(`/report-issue-payment/` + pId);
  },

  createReportIssueAdvanceOrder: async (payload: any): Promise<any> =>
    await apiIns.post("/report-issue-payment", payload),

  updateReportIssueAdvanceOrder: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/report-issue-payment/" + trsId, payload),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ReportIssueCategoryService = {
  getReportIssueCategory: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/report-issue-category` + queryStringMapper(queryParams),
    );
  },

  createReportIssue: async (payload: any): Promise<any> =>
    await apiIns.post("/report-issue-category", payload),

  updateReportIssue: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/report-issue-category/" + accId, payload),

  deleteReportIssue: async (accId: string): Promise<any> =>
    await apiIns.delete("/report-issue-category/" + accId),

  couponApply: async (accId: string, payload: any): Promise<any> =>
    await apiIns.post("/coupon/apply/" + accId, payload),
  getReportIssueList: async (accId: string): Promise<any> =>
    await apiIns.get("/report-issue/by-order/" + accId),

  createOrderReportIssue: async (payload: any): Promise<any> =>
    await apiIns.post("/report-issue", payload),

  getReportIssue: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/report-issue` + queryStringMapper(queryParams));
  },
  getReportIssueCard: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/report-issue/cart-view` + queryStringMapper(queryParams),
    );
  },

  getSingleReportIssue: async (sysid: any): Promise<any> =>
    await apiIns.get("/report-issue/issue/" + sysid),

  statusUpdate: async (sysId: any, payload: any): Promise<any> =>
    await apiIns.patch("/report-issue/" + sysId, payload),

  getReportIssueComment: async (sysid: any): Promise<any> =>
    await apiIns.get("/report-issue/report-issue-notes/" + sysid),

  createReportIssueComment: async (sysId: any, payload: any): Promise<any> =>
    await apiIns.patch("/report-issue/" + sysId, payload),

  getReportIssueLogs: async (sysid: any): Promise<any> =>
    await apiIns.get("/report-issue/report-issue-logs/" + sysid),

  getSingleReportPathaoBooking: async (sysid: any): Promise<any> =>
    await apiIns.get("/courier-booking/" + sysid),

  createReportIssuePathao: async (payload: any): Promise<any> =>
    await apiIns.post("/report-issue/report-issue-booking", payload),

  reportIssueDelete: async (issueId: string): Promise<any> =>
    await apiIns.delete("/report-issue/" + issueId),

  updateReportIssueDescription: async (
    sysId: any,
    payload: any,
  ): Promise<any> => await apiIns.patch("/report-issue/" + sysId, payload),
};

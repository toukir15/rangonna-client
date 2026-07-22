/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const marketingReportService = {
  getMarketing: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/marketing` + queryStringMapper(queryParams));
  },
  createMarketing: async (payload: any): Promise<any> =>
    await apiIns.post("/marketing", payload),

  updateMarketing: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/marketing/" + accId, payload),

  deleteMarketing: async (accId: string): Promise<any> =>
    await apiIns.delete("/marketing/" + accId),

  getMarketingReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/marketing-report` + queryStringMapper(queryParams)
    );
  },
};

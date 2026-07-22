/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const CompanyPolicyService = {
  getCompanyPolicy: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/company-policy` + queryStringMapper(queryParams));
  },
  getCompanyPolicySuggestions: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/company-policy/suggestions` + queryStringMapper(queryParams),
    );
  },
  getSingleCompanyPolicy: async (pId?: any): Promise<any> => {
    return await apiIns.get(`/company-policy/` + pId);
  },

  createCompanyPolicy: async (payload: any): Promise<any> =>
    await apiIns.post("/company-policy", payload),

  updateCompanyPolicy: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/company-policy/" + trsId, payload),

  deleteCompanyPolicy: async (trsId: string): Promise<any> =>
    await apiIns.delete("/company-policy/" + trsId),
};

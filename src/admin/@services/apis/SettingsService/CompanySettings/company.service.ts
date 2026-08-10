/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const CompanyService = {
  getCompanySetting: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/settings` + queryStringMapper(queryParams));
  },
  getCompany: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/settings/website-product-setting` + queryStringMapper(queryParams),
    );
  },
  updateCompanySettings: async (payload: any): Promise<any> =>
    await apiIns.patch("/settings", payload),
};

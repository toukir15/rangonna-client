/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ActivityService = {
  getSuggestedDomain: async (queryParams?: any): Promise<any> => {
    await apiIns.get(
      `/store/subdomain-suggestion` + queryStringMapper(queryParams)
    );
  },
};

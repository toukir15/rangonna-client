/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const generalService = {
  getGeneral: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/setting/general-settings` + queryStringMapper(queryParams)
    );
  },
};

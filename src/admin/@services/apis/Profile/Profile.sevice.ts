/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ProfileService = {
  getSalaryReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/salary/my-report` + queryStringMapper(queryParams)
    );
  },
  getAdvanceReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/salary-advance/my-report` + queryStringMapper(queryParams)
    );
  },
  getHolidayReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/salary-holiday/my-report` + queryStringMapper(queryParams)
    );
  },
};

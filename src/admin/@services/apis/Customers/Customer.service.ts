/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const CustomersService = {
  getCustomersLists: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/customer` + queryStringMapper(queryParams));
  },
  getCustomersListsMonth: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/customer-report/month` + queryStringMapper(queryParams));
  },
  
};

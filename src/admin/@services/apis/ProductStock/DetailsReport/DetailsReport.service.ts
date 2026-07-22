/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const DetailsReportService = {
  getMyWarehouseReportIn: async (pId: any,queryParams?: any ): Promise<any> => {
    return await apiIns.get(
      `/product-report/received-quantity/` + pId + queryStringMapper(queryParams)
    );
  },
  getMyWarehouseReportOut: async (pId: any,queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-report/released-quantity/` + pId + queryStringMapper(queryParams)
    );
  },

  getMyWarehouseReportCartIn: async (pId: any ,queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-report/received-quantity/summary/` + pId  + queryStringMapper(queryParams)
    );
  },

  getMyWarehouseReportCartOut: async (pId: any,queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-report/released-quantity/summary/` + pId + queryStringMapper(queryParams)
    );
  },

};

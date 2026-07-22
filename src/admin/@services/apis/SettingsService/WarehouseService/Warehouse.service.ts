/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const WarehouseService = {
  getWarehouse: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/warehouse` + queryStringMapper(queryParams));
  },
  getWarehouseSuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/warehouse/suggestions` + queryStringMapper(queryParams),
    );
  },
  getLeavePolicySuggestion: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/leave-policy/suggestions` + queryStringMapper(queryParams),
    );
  },

  createWarehouse: async (payload: any): Promise<any> =>
    await apiIns.post("/warehouse", payload),

  updateWarehouse: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/warehouse/" + accId, payload),

  deleteWarehouse: async (accId: string): Promise<any> =>
    await apiIns.delete("/warehouse/" + accId),

  createProductStockSync: async (): Promise<any> =>
    await apiIns.post("/product-stock-report/product-stock-sync"),
  createProductSearchSync: async (): Promise<any> =>
    await apiIns.post("product/sync-products-to-meili"),

  // getWarehouseReport: async (queryParams?: any): Promise<any> => {
  //   return await apiIns.get(`/current-value` + queryStringMapper(queryParams));
  // },
  getWarehouseReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-stock-report/summery` + queryStringMapper(queryParams),
    );
  },
  getCurrentValue: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/current-value/summary` + queryStringMapper(queryParams),
    );
  },
  getCurrentValueMonthly: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/current-value/monthly` + queryStringMapper(queryParams),
    );
  },
  getStockSummary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-stock-report/summery` + queryStringMapper(queryParams),
    );
  },
  getReportSummary: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-stock-report/stock-report-summery` +
        queryStringMapper(queryParams),
    );
  },
};

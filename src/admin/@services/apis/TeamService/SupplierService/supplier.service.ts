/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const SupplierService = {
  getAllSupplier: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/supplier` + queryStringMapper(queryParams));
  },

  createSupplier: async (payload: any): Promise<any> =>
    await apiIns.post("/supplier", payload),

  updateSupplier: async (supId: string, payload: any): Promise<any> =>
    await apiIns.patch("/supplier/" + supId, payload),

  updateSupplierToggle: async (supId: string, payload: any): Promise<any> =>
    await apiIns.patch("/supplier/active-status/" + supId, payload),

  updateSupplierPriority: async (payload: any): Promise<any> =>
    await apiIns.patch("/supplier/priority", payload),

  deleteSupplier: async (supId: string): Promise<any> =>
    await apiIns.delete("/supplier/" + supId),

  getAllSupplierSuggestions: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/supplier/suggestions` + queryStringMapper(queryParams)
    );
  },
};

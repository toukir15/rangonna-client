/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const productGroupService = {
  getProductGroup: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/product-group` + queryStringMapper(queryParams));
  },

  createProductGroup: async (payload: any): Promise<any> =>
    await apiIns.post("/product-group", payload),

  updateProductGroup: async (productId: any, payload: any): Promise<any> =>
    await apiIns.patch("/product-group/" + productId, payload),

  removeGroup: async (productId: any): Promise<any> =>
    await apiIns.delete("/product-group/" + productId),
};

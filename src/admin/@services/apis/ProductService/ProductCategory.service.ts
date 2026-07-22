/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ProductCategoryService = {
  getProductCategory: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-category` + queryStringMapper(queryParams)
    );
  },

  createProductCategory: async (payload: any): Promise<any> =>
    await apiIns.post("/product-category", payload),

  updateProductCategory: async (brandId: string, payload: any): Promise<any> =>
    await apiIns.patch("/product-category/" + brandId, payload),

  deleteProductCategory: async (brandId: string): Promise<any> =>
    await apiIns.delete("/product-category/" + brandId),

  getProductCategorySuggestions: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-category/suggestions` + queryStringMapper(queryParams)
    );
  },
};

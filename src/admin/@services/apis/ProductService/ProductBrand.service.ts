/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const ProductBrandService = {
  getProductBrand: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/product-brand` + queryStringMapper(queryParams));
  },

  createProductBrand: async (payload: any): Promise<any> =>
    await apiIns.post("/product-brand", payload),

  updateProductBrand: async (brandId: string, payload: any): Promise<any> =>
    await apiIns.patch("/product-brand/" + brandId, payload),

  deleteProductBrand: async (brandId: string): Promise<any> =>
    await apiIns.delete("/product-brand/" + brandId),

  getProductBrandSuggestions: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/product-brand/suggestions` + queryStringMapper(queryParams)
    );
  },
};

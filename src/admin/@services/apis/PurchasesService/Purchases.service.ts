/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const PurchasesService = {
  getPurchases: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/purchase` + queryStringMapper(queryParams));
  },

  createPurchases: async (payload: any): Promise<any> =>
    await apiIns.post("/purchase", payload),

  updatePurchases: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/purchase/" + pId, payload),

  deletePurchases: async (pId: string): Promise<any> =>
    await apiIns.delete("/purchase/" + pId),

  updatePurchasesProduct: async (pId: string, payload: any): Promise<any> =>
    await apiIns.patch("/product/product-purchase/" + pId, payload),

  getSinglePurchases: async (pId: any): Promise<any> =>
    await apiIns.get("/purchase/" + pId),

  deletePurchasesProduct: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/purchase/purchase-product/" + pId, payload),

  createPurchasesPayment: async (pId: any, payload: any): Promise<any> =>
    await apiIns.post("/purchase-payment/" + pId, payload),

  getShowPayment: async (pId: any): Promise<any> =>
    await apiIns.get("/purchase-payment/purchase/" + pId),

  getPurchasePaymentReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/purchase-payment` + queryStringMapper(queryParams)
    );
  },

  updatePurchasesPayment: async (pId: string, payload: any): Promise<any> =>
    await apiIns.patch("/purchase-payment/" + pId, payload),

  deletePurchasesPayment: async (pId: any): Promise<any> =>
    await apiIns.delete("/purchase-payment/" + pId),
};

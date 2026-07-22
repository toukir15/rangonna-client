/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const PurchasesReturnService = {
  getPurchasesReturn: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/purchase-return` + queryStringMapper(queryParams)
    );
  },

  createPurchasesReturn: async (payload: any): Promise<any> =>
    await apiIns.post("/purchase-return", payload),

  updatePurchases: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/purchase-return/" + pId, payload),

  deletePurchasesReturn: async (pId: string): Promise<any> =>
    await apiIns.delete("/purchase-return/" + pId),

  updatePurchasesProduct: async (pId: string, payload: any): Promise<any> =>
    await apiIns.patch("/product/product-purchase-return/" + pId, payload),

  getSinglePurchases: async (pId: any): Promise<any> =>
    await apiIns.get("/purchase-return/" + pId),

  deletePurchasesProduct: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/purchase/purchase-return-product/" + pId, payload),

  createPurchasesPayment: async (pId: any, payload: any): Promise<any> =>
    await apiIns.post("/purchase-return-payment/" + pId, payload),

  getShowPayment: async (pId: any): Promise<any> =>
    await apiIns.get("/purchase-return-payment/purchase-return/" + pId),

  getPurchasePaymentReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/purchase-return-payment` + queryStringMapper(queryParams)
    );
  },

  updatePurchasesPayment: async (pId: string, payload: any): Promise<any> =>
    await apiIns.patch("/purchase-return-payment/" + pId, payload),

  deletePurchasesPayment: async (pId: any): Promise<any> =>
    await apiIns.delete("/purchase-return-payment/" + pId),
};

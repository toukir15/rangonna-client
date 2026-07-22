/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const WholesaleReturnService = {
  getWholesaleReturn: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/wholesale-return` + queryStringMapper(queryParams),
    );
  },

  createPurchasesReturn: async (payload: any): Promise<any> =>
    await apiIns.post("/wholesale-return", payload),

  updatePurchases: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-return/" + pId, payload),

  deleteWholesaleReturn: async (pId: string): Promise<any> =>
    await apiIns.delete("/wholesale-return/" + pId),

  updatePurchasesProduct: async (pId: string, payload: any): Promise<any> =>
    await apiIns.patch(
      "/wholesale-product/product-sales-return/" + pId,
      payload,
    ),
  getSinglePurchases: async (pId: any): Promise<any> =>
    await apiIns.get("/wholesale-return/" + pId),

  getSingleWholesaleReturn: async (pId: any): Promise<any> =>
    await apiIns.get("/wholesale-return/" + pId),

  deletePurchasesProduct: async (pId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-sales/sales-return-product/" + pId, payload),

  createPurchasesPayment: async (pId: any, payload: any): Promise<any> =>
    await apiIns.post("/wholesale-purchase-return-payment/" + pId, payload),

  getShowPayment: async (pId: any): Promise<any> =>
    await apiIns.get(
      "/wholesale-purchase-return-payment/purchase-return/" + pId,
    ),

  getPurchasePaymentReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/wholesale-purchase-return-payment` + queryStringMapper(queryParams),
    );
  },

  updatePurchasesPayment: async (pId: string, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-purchase-return-payment/" + pId, payload),

  deletePurchasesPayment: async (pId: any): Promise<any> =>
    await apiIns.delete("/wholesale-purchase-return-payment/" + pId),

  getWholesaleReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/wholesale-user-report` + queryStringMapper(queryParams),
    );
  },

  createWholesalePayment: async (pId: any, payload: any): Promise<any> =>
    await apiIns.post("/wholesale-return-payment/" + pId, payload),

  updateWholesalePayment: async (pId: string, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-return-payment/" + pId, payload),

  deleteWholesalePayment: async (pId: any): Promise<any> =>
    await apiIns.delete("/wholesale-return-payment/" + pId),

  getShowPaymentWholeSale: async (pId: any): Promise<any> =>
    await apiIns.get("/wholesale-return-payment/sales-return/" + pId),

  createWholeSaleOrderPayment: async (payload: any): Promise<any> =>
    await apiIns.post("/wholesale-order-payment", payload),

  updateWholesaleOrderPayment: async (
    pId: string,
    payload: any,
  ): Promise<any> =>
    await apiIns.patch("/wholesale-order-payment/" + pId, payload),

  deleteWholesaleOrderPayment: async (pId: any): Promise<any> =>
    await apiIns.delete("/wholesale-order-payment/" + pId),

  getWholesaleOrderShowPayment: async (pId: any): Promise<any> =>
    await apiIns.get("/wholesale-order-payment/payments/" + pId),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const wholesaleOrderService = {
  getOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/wholesale-order` + queryStringMapper(queryParams),
    );
  },
  getStatusCount: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/courier-booking/booking-count` + queryStringMapper(queryParams),
    );
  },

  updateProduct: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-order/" + orderId, payload),

  orderDelete: async (oId: string): Promise<any> =>
    await apiIns.delete("/order/" + oId),
  orderDetails: async (oId: any): Promise<any> =>
    await apiIns.get("/wholesale-order/" + oId),

  statusUpdate: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch(
      "/wholesale-order/change-order-status/" + orderId,
      payload,
    ),
  statusUpdateDeliveryAdmin: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/stock-calculation/delivery-order/" + orderId, payload),
  statusUpdateAdmin: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch(
      "/stock-calculation/refund-exchange/" + orderId,
      payload,
    ),

  statusUpdateDelivery: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/delivery-order/" + orderId, payload),

  statusUpdateReportDelivery: async (
    orderId: any,
    payload: any,
  ): Promise<any> =>
    await apiIns.patch("/stock-calculation/delivery-order/" + orderId, payload),

  noteUpdate: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-order/order-notes/" + orderId, payload),

  updateAdvance: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-order/transaction/" + orderId, payload),

  getStatus: async (): Promise<any> => {
    return await apiIns.get(`/order-status`);
  },

  getOrdersNotes: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/wholesale-order/order-notes/` + queryParams);
  },
  getOrdersHistory: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/wholesale-order/order-history/` + queryParams);
  },

  getInvoicePrint: async (oId: any): Promise<any> =>
    await apiIns.get("/wholesale-invoice/" + oId),

  getInvoicePrintList: async (oId: any): Promise<any> =>
    await apiIns.get(`/wholesale-invoice?order_ids=${oId}`),

  updateCustomerNote: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-order/" + orderId, payload),

  orderLogs: async (sysId: any): Promise<any> =>
    await apiIns.get(`/wholesale-order-logs/${sysId}`),

  updateNextOrder: async (status: any): Promise<any> =>
    await apiIns.get(`/wholesale-order/next-previous?status=${status}`),

  updatePrintStatus: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/" + orderId, payload),

  updateStatusPrint: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-order/print-status/" + orderId, payload),

  orderSumary: async (oId: any): Promise<any> =>
    await apiIns.get(`/wholesale-order/order-summary/${oId}`),

  fetchCurrentStatus: async (oId: any): Promise<any> =>
    await apiIns.get(`/wholesale-order/order-status/${oId}`),

  fetchPrintStatus: async (oId: any): Promise<any> =>
    await apiIns.get(`/wholesale-order/print-status/${oId}`),

  createReportIssue: async (reportId: string): Promise<any> =>
    await apiIns.post("/report-issue/check-report-issue/" + reportId),

  getBooking: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/courier-booking` + queryStringMapper(queryParams),
    );
  },

  statusFixDelivery: async (orderId: string): Promise<any> =>
    await apiIns.patch("/courier-booking/fixed-courier-error/" + orderId),

  returnStockUpdate: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch(
      "/wholesale-stock-calculation/back-product-stock/" + orderId,
      payload,
    ),

  createOrder: async (payload: any): Promise<any> =>
    await apiIns.post("/order", payload),

  updateOrderSource: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/source/" + orderId, payload),

  updatePathaoBooking: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-order/update-city-zone/" + orderId, payload),

  getPathaoCity: async (): Promise<any> =>
    await apiIns.get("/pathao/city-list"),

  getPathaoZone: async (cID: string): Promise<any> =>
    await apiIns.get("/pathao/zone-list/" + cID),

  getWholesaleUserSuggestions: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/wholesale-user/suggestions` + queryStringMapper(queryParams),
    );
  },
  getWholesaleUser: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/wholesale-user` + queryStringMapper(queryParams));
  },

  updateWholeSaleUser: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/wholesale-user/active-status/" + orderId, payload),
  updateWholeSalePaymentMethod: async (
    orderId: any,
    payload: any,
  ): Promise<any> =>
    await apiIns.patch(
      "/wholesale-user/add-payment-method/" + orderId,
      payload,
    ),

  getWholeSaleProduct: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/wholesale-product` + queryStringMapper(queryParams),
    );
  },

  enableWholesaleProduct: async (orderId: any): Promise<any> =>
    await apiIns.patch("/wholesale-product/enable-wholesale/" + orderId),

  disableWholesaleProduct: async (orderId: any): Promise<any> =>
    await apiIns.patch("/wholesale-product/disable-wholesale/" + orderId),

  wholeSaleUpdateDelivery: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch(
      "/wholesale-stock-calculation/delivery-order/" + orderId,
      payload,
    ),
};

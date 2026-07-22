/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const OrdersService = {
  getOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/order/all` + queryStringMapper(queryParams));
  },
  getLastSixtyDay: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/last-sixty-days` + queryStringMapper(queryParams),
    );
  },
  getShowroomOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/showroom-order` + queryStringMapper(queryParams),
    );
  },
  getNaviforceOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/naviforce` + queryStringMapper(queryParams),
    );
  },
  getTimeVerseOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/timeverse` + queryStringMapper(queryParams),
    );
  },
  getBikretaOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/order/bikreta` + queryStringMapper(queryParams));
  },
  getOlevsOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/order/olevs` + queryStringMapper(queryParams));
  },

  getStatusCount: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/courier-booking/booking-count` + queryStringMapper(queryParams),
    );
  },
  orderDelete: async (oId: string): Promise<any> =>
    await apiIns.delete("/order/" + oId),
  orderDetails: async (oId: any): Promise<any> =>
    await apiIns.get("/order/" + oId),

  statusUpdate: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/change-order-status/" + orderId, payload),
  statusUpdateDeliveryAdmin: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/stock-calculation/delivery-order/" + orderId, payload),
  statusUpdateAdmin: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch(
      "/stock-calculation/refund-exchange/" + orderId,
      payload,
    ),

  statusUpdateDelivery: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/delivery-order/" + orderId, payload),

  statusUpdateReportDelivery: async (orderId: any): Promise<any> =>
    await apiIns.patch(
      "/stock-calculation/courier-report-delivery-order/" + orderId,
    ),

  noteUpdate: async (orderId: any, payload: any): Promise<any> => {
    const updateRes: any = await apiIns.patch(
      "/order/order-notes/" + orderId,
      payload,
    );

    if (!updateRes?.success) {
      return Promise.reject(updateRes);
    }

    const notesRes: any = await apiIns.get(`/order/order-notes/${orderId}`);

    return {
      ...updateRes,
      notes: notesRes?.data,
    };
  },

  updateAdvance: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/advance-delivery/" + orderId, payload),

  getStatus: async (): Promise<any> => {
    return await apiIns.get(`/order-status`);
  },

  getOrdersNotes: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/order/order-notes/` + queryParams);
  },
  getOrdersHistory: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/order/order-history/` + queryParams);
  },

  getInvoicePrint: async (oId: any): Promise<any> =>
    await apiIns.get("/invoice/" + oId),
  getReportIssueInvoice: async (oId: any): Promise<any> =>
    await apiIns.get("/report-issue/invoice/" + oId),

  getInvoicePrintList: async (oId: any): Promise<any> =>
    await apiIns.get(`/invoice?order_ids=${oId}`),

  updateCustomerNote: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/" + orderId, payload),

  orderLogs: async (sysId: any): Promise<any> =>
    await apiIns.get(`/order-logs/${sysId}`),

  updateNextOrder: async (status: any, domain: string): Promise<any> =>
    await apiIns.get(`/order/next-previous?status=${status}&domain=${domain}`),

  updateReportIssueNextOrder: async (status: any): Promise<any> =>
    await apiIns.get(`/report-issue/next-previous?status=${status}`),

  updatePrintStatus: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/" + orderId, payload),

  updateStatusPrint: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/print-status/" + orderId, payload),

  orderSumary: async (oId: any): Promise<any> =>
    await apiIns.get(`/order/order-summary/${oId}`),

  fetchCurrentStatus: async (oId: any): Promise<any> =>
    await apiIns.get(`/order/order-status/${oId}`),

  fetchPrintStatus: async (oId: any): Promise<any> =>
    await apiIns.get(`/order/print-status/${oId}`),

  createReportIssue: async (reportId: string): Promise<any> =>
    await apiIns.post("/report-issue/check-report-issue/" + reportId),

  getBooking: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/courier-booking` + queryStringMapper(queryParams),
    );
  },
  // getPathaoList: async (queryParams?: any): Promise<any> => {
  //   return await apiIns.get(
  //     `/courier-booking/booking-report` + queryStringMapper(queryParams),
  //   );
  // },
  getCourierReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/courier-report` + queryStringMapper(queryParams));
  },
  getCourierCardViewReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/courier-report/cart-view` + queryStringMapper(queryParams),
    );
  },

  statusFixDelivery: async (orderId: string): Promise<any> =>
    await apiIns.patch("/courier-booking/fixed-courier-error/" + orderId),

  returnStockUpdate: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch(
      "/stock-calculation/back-product-stock/" + orderId,
      payload,
    ),

  createOrder: async (payload: any): Promise<any> =>
    await apiIns.post("/order", payload),

  createShowroomOrder: async (payload: any): Promise<any> =>
    await apiIns.post("/order/showroom", payload),

  updateOrderSource: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/source/" + orderId, payload),

  updateOrderWarehouse: async (orderId: any, payload: any): Promise<any> =>
    await apiIns.patch("/order/" + orderId, payload),

  getDelayDelivery: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/courier-booking/delay-delivery` + queryStringMapper(queryParams),
    );
  },

  getFulfillmentOrders: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/order/fullfillment` + queryStringMapper(queryParams),
    );
  },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const orderTransactionService = {
  getOrderTransactionReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/payment-report/order-payments` + queryStringMapper(queryParams)
    );
  },
};

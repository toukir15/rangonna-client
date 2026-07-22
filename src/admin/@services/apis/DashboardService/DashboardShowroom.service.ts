/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const DashboardShowroomService = {
  getDashboardShowroomList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/showroom/payment-history` + queryStringMapper(queryParams)
    );
  },
  getAdminDashboardShowroomList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/showroom/payment-history/admin` + queryStringMapper(queryParams)
    );
  },
  getShowroomListQuick: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/showroom/payment-history/quick-view` +
        queryStringMapper(queryParams)
    );
  },
  getAdminShowroomListQuick: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/showroom/payment-history/quick-view/admin` +
        queryStringMapper(queryParams)
    );
  },
  getExpenseQuick: async (
    expensesId: string,
    queryParams?: any
  ): Promise<any> => {
    return await apiIns.get(
      `/expense-report/sub-category/${expensesId}` +
        queryStringMapper(queryParams)
    );
  },

  getCartList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/showroom` + queryStringMapper(queryParams)
    );
  },
  getAdminCartList: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/dashboard/showroom/admin` + queryStringMapper(queryParams)
    );
  },
  getExpenseReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/showroom-expense-report` + queryStringMapper(queryParams)
    );
  },
  getAdminExpenseReport: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/showroom-expense-report/admin` + queryStringMapper(queryParams)
    );
  },

  createExpenses: async (payload: any): Promise<any> =>
    await apiIns.post("/showroom-expense-report", payload),

  updateExpenses: async (expensesId: string, payload: any): Promise<any> =>
    await apiIns.patch("/showroom-expense-report/" + expensesId, payload),

  updateExpenseReport: async (expensesId: string, payload: any): Promise<any> =>
    await apiIns.patch(
      "/showroom-expense-report/status/" + expensesId,
      payload
    ),
};

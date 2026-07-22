/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { IQueryParams, queryStringMapper } from "@admin/utils";

export const AccountListService = {
  getAccountList: async (queryParams?: IQueryParams): Promise<any> => {
    return await apiIns.get(`/accounts` + queryStringMapper(queryParams));
  },
  getBalanceSheet: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(
      `/account-report/total-balance-sheet` + queryStringMapper(queryParams)
    );
  },
  getSyncBalanceSheet: async (pId: any): Promise<any> => {
    return await apiIns.get(
      `/account-report/after-sync-method-summary/` + pId
    );
  },

  createAccountList: async (payload: any): Promise<any> =>
    await apiIns.post("/accounts", payload),

  updateAccountList: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/accounts/" + accId, payload),
  updateAccountPriority: async (payload: any): Promise<any> =>
    await apiIns.patch("/accounts/priority", payload),

  updateToggleAccountList: async (accId: string, payload: any): Promise<any> =>
    await apiIns.patch("/accounts/active-status/" + accId, payload),

  deleteAccountList: async (accId: string): Promise<any> =>
    await apiIns.delete("/accounts/" + accId),

  getAccountSuggestion: async (queryParams?: IQueryParams): Promise<any> => {
    return await apiIns.get(
      `/accounts/suggestions` + queryStringMapper(queryParams)
    );
  },

  updateAccountBalance: async (accId: string): Promise<any> =>
    await apiIns.patch("/accounts/account-balance/" + accId),
};

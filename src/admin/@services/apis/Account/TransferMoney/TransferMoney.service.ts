/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiIns } from "@admin/@config/api.config";
import { queryStringMapper } from "@admin/utils";

export const TransferMoneyService = {
  getTransferMoney: async (queryParams?: any): Promise<any> => {
    return await apiIns.get(`/transfer-money` + queryStringMapper(queryParams));
  },

  createTransferMoney: async (payload: any): Promise<any> =>
    await apiIns.post("/transfer-money", payload),

  updateTransferMoney: async (trsId: string, payload: any): Promise<any> =>
    await apiIns.patch("/transfer-money/" + trsId, payload),

  deleteTransferMoney: async (trsId: string): Promise<any> =>
    await apiIns.delete("/transfer-money/" + trsId),
};

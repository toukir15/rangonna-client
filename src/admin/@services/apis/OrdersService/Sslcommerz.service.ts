import { apiIns } from "@admin/@config/api.config";
import { ISslcommerzTransactionResponse } from "@admin/@interfaces/sslcommerz/sslcommerz.interface";

export const SslcommerzService = {
  getTransaction: async (
    trxId: string,
  ): Promise<ISslcommerzTransactionResponse> =>
    await apiIns.get(`/sslcommerz/transaction/${trxId}`),
};
